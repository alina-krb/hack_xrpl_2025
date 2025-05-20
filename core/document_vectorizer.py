import os
import json
import time
import logging
import argparse
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any, Tuple
import mimetypes
from pathlib import Path

# Document loaders
from langchain_community.document_loaders import (
    PyMuPDFLoader,
    TextLoader,
    UnstructuredPowerPointLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores.faiss import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document

# ─── Logging Setup ────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger()

# ─── Environment Setup ──────────────────────────────────────────────
load_dotenv()

# ─── Paths ──────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent.resolve()
DATA_DIR = BASE_DIR / "data"

class DocumentProcessor:
    """Class for loading and processing documents of various types"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise EnvironmentError("OPENAI_API_KEY not found in environment variables.")
        
        # Initialize embedding model
        self.embeddings = OpenAIEmbeddings(openai_api_key=self.openai_api_key)
    
    @staticmethod
    def detect_file_type(file_path: str) -> str:
        """
        Detect the file type based on extension and MIME type
        
        Args:
            file_path: Path to the file
            
        Returns:
            String representing file type (pdf, txt, presentation, etc.)
        """
        mime_type, _ = mimetypes.guess_type(file_path)
        extension = os.path.splitext(file_path)[1].lower()
        
        if extension == '.pdf' or mime_type == 'application/pdf':
            return 'pdf'
        elif extension == '.txt' or mime_type == 'text/plain':
            return 'txt'
        elif extension in ['.pptx', '.ppt'] or mime_type in [
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-powerpoint'
        ]:
            return 'presentation'
        elif extension in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'] or (mime_type and mime_type.startswith('image/')):
            return 'image'
        elif extension in ['.xlsx', '.xls', '.csv'] or mime_type in [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ]:
            return 'spreadsheet'
        elif extension in ['.docx', '.doc'] or mime_type in [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ]:
            return 'document'
        else:
            return 'unknown'
    
    def load_image_with_tesseract(self, file_path: str) -> List[Document]:
        """
        Load an image and extract text using Tesseract OCR via pytesseract
        
        Args:
            file_path: Path to the image file
            
        Returns:
            List containing a single document with extracted text
        """
        try:
            # Import libraries for image processing
            try:
                from PIL import Image
                import pytesseract
            except ImportError:
                log.error("Missing dependencies for image processing")
                log.error("Install with: pip install pillow pytesseract")
                log.error("And ensure Tesseract OCR is installed on your system")
                return []
            
            log.info(f"Processing image with Tesseract OCR: {file_path}")
            
            # Open the image
            img = Image.open(file_path)
            
            # Extract text
            text = pytesseract.image_to_string(img)
            
            if not text.strip():
                log.warning(f"No text extracted from image: {file_path}")
                return []
            
            # Create a document
            doc = Document(
                page_content=text,
                metadata={
                    "source": file_path,
                    "file_type": "image",
                    "title": os.path.basename(file_path)
                }
            )
            
            return [doc]
            
        except Exception as e:
            log.error(f"Error processing image with Tesseract: {e}")
            return []
    
    def load_document(self, file_path: str, file_type: Optional[str] = None) -> Tuple[List[Any], str]:
        """
        Load a document based on its file type or content.
        
        Args:
            file_path: Path to the document.
            file_type: Optional override for file type detection.

        Returns:
            Tuple of (list of Document objects, detected file type).
        """
        extension = os.path.splitext(file_path)[1].lower()
        mime_type, _ = mimetypes.guess_type(file_path)
        file_type = file_type or self.detect_file_type(file_path)
        log.info(f"Loading {file_type} document: {file_path}...")

        documents = []

        try:
            if file_type == 'pdf':
                try:
                    loader = PyMuPDFLoader(file_path)
                    documents = loader.load()
                    if documents and len(''.join([doc.page_content for doc in documents])) < 100:
                        log.warning(f"Limited text content in PDF, might need OCR: {file_path}")
                except Exception as e:
                    log.error(f"Error loading PDF with PyMuPDFLoader: {e}")
                    documents = []

            elif file_type == 'txt':
                loader = TextLoader(file_path)
                documents = loader.load()

            elif file_type == 'presentation':
                try:
                    loader = UnstructuredPowerPointLoader(file_path)
                    documents = loader.load()
                except Exception as e:
                    log.error(f"Error loading PowerPoint file: {e}")
                    documents = []

            elif file_type == 'image':
                documents = self.load_image_with_tesseract(file_path)

            elif extension == '.json' or mime_type == 'application/json':
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    if "text" not in data:
                        log.warning(f"'text' field missing in JSON: {file_path}")
                        return [], 'json'
                    if not data["text"].strip():
                        log.warning(f"Transcript text is empty in {file_path}")
                        return [], 'json'

                    text = data["text"]
                    doc = Document(
                        page_content=text,
                        metadata={
                            "source": file_path,
                            "file_type": "json",
                            "title": os.path.basename(file_path)
                        }
                    )
                    documents = [doc]
                except Exception as e:
                    log.error(f"Error reading transcript JSON: {e}")
                    return [], 'json'

            else:
                log.warning(f"Unsupported file type {file_type} for {file_path}, skipping")
                return [], file_type

        except Exception as e:
            log.error(f"Unexpected error while loading {file_path}: {e}")
            return [], file_type

        # Enhance metadata
        for doc in documents:
            if not hasattr(doc, 'metadata'):
                doc.metadata = {}
            doc.metadata.setdefault('source', file_path)
            doc.metadata.setdefault('file_type', file_type)
            doc.metadata.setdefault('title', os.path.basename(file_path))

        return documents, file_type
    
    def load_documents_from_directory(self, 
                                     directory_path: str, 
                                     glob_pattern: Optional[str] = None,
                                     file_types: Optional[List[str]] = None) -> Dict[str, List[Any]]:
        """
        Load all supported documents from a directory, organized by file type
        
        Args:
            directory_path: Path to the directory containing documents
            glob_pattern: Optional glob pattern to filter files
            file_types: Optional list of file types to include
            
        Returns:
            Dictionary of file_type -> list of document objects
        """
        if file_types is None:
            file_types = ['pdf', 'txt', 'presentation', 'image', 'spreadsheet', 'document', 'json']
            
        documents_by_type = {file_type: [] for file_type in file_types}
        
        # Manually walk through the directory
        for root, _, files in os.walk(directory_path):
            for file in files:
                file_path = os.path.join(root, file)
                
                # Skip hidden files
                if os.path.basename(file_path).startswith('.'):
                    continue
                
                # Detect file type
                file_type = self.detect_file_type(file_path)
                
                # Skip if not in requested file types
                if file_type not in file_types:
                    continue
                
                # Load document
                docs, detected_type = self.load_document(file_path)
                if docs:
                    # Store by detected type
                    documents_by_type[detected_type].extend(docs)
        
        # Log summary
        for file_type, docs in documents_by_type.items():
            if docs:
                log.info(f"Loaded {len(docs)} document segments of type '{file_type}'")
            
        return documents_by_type
    
    def process_documents(self, documents: List[Any], chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Any]:
        """
        Process documents into text chunks suitable for embedding
        
        Args:
            documents: List of document objects
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks
        
        Returns:
            List of processed document chunks
        """
        if not documents:
            log.warning("No chunks produced from document")
            return []
            
        # Split documents into chunks
        splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        docs = splitter.split_documents(documents)
        
        log.info(f"Split {len(documents)} documents into {len(docs)} chunks")
        return docs
    
    def create_vector_store(self,documents: List[Any],data_type: str, 
                            output_dir: str = str(DATA_DIR / "vector_db"), 
                            batch_size: int = 16, 
                            combine_all: bool = True) -> FAISS:
        """
        Create a FAISS vector store from document chunks
        
        Args:
            documents: List of document chunks
            data_type: Data type for organization (used as metadata, not for folder structure when combine_all=True)
            output_dir: Directory for vector store
            batch_size: Number of documents to process in each embedding batch
            combine_all: If True, all documents go to the same vector store regardless of type
            
        Returns:
            FAISS vector store object
        """
        if not documents:
            log.warning(f"No documents to vectorize for {data_type}")
            return None
            
        # Create vector store path (no longer using data_type in the path)
        vector_store_path = output_dir
        os.makedirs(vector_store_path, exist_ok=True)
        
        # Add data_type to each document's metadata if it's not already there
        for doc in documents:
            doc.metadata['doc_type'] = data_type
        
        # Batch embedding
        texts = [doc.page_content for doc in documents]
        metadatas = [doc.metadata for doc in documents]
        
        vectors = []
        log.info(f"Processing embeddings for {data_type} in batches of {batch_size}...")
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            try:
                result = self.embeddings.embed_documents(batch_texts)
                vectors.extend(result)
                log.info(f"✅ Embedded batch {i//batch_size + 1}/{(len(texts) + batch_size - 1)//batch_size}")
            except Exception as e:
                log.error(f"❌ Failed batch {i//batch_size + 1}: {e}")
            time.sleep(0.5)  # Rate limit protection
        
        # Create FAISS index
        log.info(f"Creating FAISS vector store for {data_type}...")
        
        # Check if vector store already exists - if so, merge with existing
        if os.path.exists(os.path.join(vector_store_path, "index.faiss")):
            log.info(f"Existing vector store found, merging new documents...")
            # Load existing vector store
            existing_db = FAISS.load_local(vector_store_path, self.embeddings, allow_dangerous_deserialization=True)
            # Add new texts
            existing_db.add_texts(texts=texts, metadatas=metadatas)
            # Save updated vector store
            existing_db.save_local(vector_store_path)
            db = existing_db
        else:
            # Create new vector store
            db = FAISS.from_texts(texts=texts, embedding=self.embeddings, metadatas=metadatas)
            db.save_local(vector_store_path)
        
        log.info(f"Vector store saved to {vector_store_path}")
        
        return db

class DocumentVectorizer:
    """Main class for vectorizing documents by data type"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.processor = DocumentProcessor(openai_api_key)
    
    def vectorize_by_format(self,
                          input_path: str,
                          output_dir: str = str(DATA_DIR / "vector_db"),
                          batch_size: int = 16,
                          chunk_size: int = 1000,
                          chunk_overlap: int = 200,
                          combine_all: bool = True) -> Dict[str, FAISS]:
        """
        Vectorize documents by format/data type
        
        Args:
            input_path: Path to document file or directory
            output_dir: Base directory for vector stores
            batch_size: Number of documents to process in each embedding batch
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks
            combine_all: If True, all documents go to the same vector store regardless of type
            
        Returns:
            Dictionary of data_type -> FAISS vector store
        """
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)

        vector_stores = {}
        all_data_types = set()
        
        # Handle file or directory
        if os.path.isfile(input_path):
            # Single file - determine type and vectorize
            documents, file_type = self.processor.load_document(input_path)
            
            if documents:
                # Process into chunks
                chunks = self.processor.process_documents(documents, chunk_size, chunk_overlap)
                
                # Create vector store
                db = self.processor.create_vector_store(chunks, file_type, output_dir, batch_size, combine_all)
                if db:
                    vector_stores[file_type] = db
                    all_data_types.add(file_type)
                
        elif os.path.isdir(input_path):
            # Directory - process all files by type
            documents_by_type = self.processor.load_documents_from_directory(input_path)
            
            # Process and vectorize each type
            for data_type, docs in documents_by_type.items():
                if docs:
                    # Process into chunks
                    chunks = self.processor.process_documents(docs, chunk_size, chunk_overlap)
                    
                    # Create vector store
                    db = self.processor.create_vector_store(chunks, data_type, output_dir, batch_size, combine_all)
                    if db:
                        vector_stores[data_type] = db
                        all_data_types.add(data_type)
        else:
            raise ValueError(f"Input path does not exist: {input_path}")
        
        # If combining all types, update the return value to reflect the combined store
        if combine_all and all_data_types:
            # Since we're using the same vector store for all types, we can simplify the return
            # to just have a single entry with a combined name
            combined_name = "combined"
            if os.path.exists(os.path.join(output_dir, "index.faiss")):
                # Load the combined vector store
                combined_db = FAISS.load_local(output_dir, self.processor.embeddings, allow_dangerous_deserialization=True)
                vector_stores = {combined_name: combined_db}
                log.info(f"Vectorization complete with all data types combined into one store: {', '.join(all_data_types)}")
            else:
                log.warning("No vector store was created.")
                vector_stores = {}
        else:
            log.info(f"Vectorization complete with {len(vector_stores)} separate data types")
        
        return vector_stores

def main():
    parser = argparse.ArgumentParser(description="Vectorize documents into FAISS vector store.")
    parser.add_argument("--input", required=True, nargs="+",help="One or more file paths to vectorize (e.g., data/doc1.pdf data/doc2.txt)")    
    parser.add_argument("--output", default=str(BASE_DIR / "data" / "vector_db"), help="Output folder for FAISS vector store")
    parser.add_argument("--chunk-size", type=int, default=1000, help="Size of text chunks")
    parser.add_argument("--chunk-overlap", type=int, default=200, help="Overlap between chunks")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size for OpenAI embedding requests")
    parser.add_argument("--openai-api-key", help="OpenAI API key (or use .env)")
    parser.add_argument("--separate-by-type", action="store_false", dest="combine_all", help="Keep separate vector DBs by file type")
    parser.set_defaults(combine_all=True)
    args = parser.parse_args()

    input_paths = [Path(p).resolve() if Path(p).is_absolute() else (BASE_DIR / p).resolve() for p in args.input]
    output_path = Path(args.output).resolve()

    for path in input_paths:
        if not path.exists():
            log.error(f"❌ Input path does not exist: {path}")
            exit(1)
        log.info(f"📂 Input path: {path}")
    log.info(f"💾 Output path: {output_path}")

    vectorizer = DocumentVectorizer(openai_api_key=args.openai_api_key)

    stores = {}
    try:
        for input_path in input_paths:
            s = vectorizer.vectorize_by_format(
                input_path=str(input_path),
                output_dir=str(output_path),
                batch_size=args.batch_size,
                chunk_size=args.chunk_size,
                chunk_overlap=args.chunk_overlap,
                combine_all=args.combine_all,
            )
            stores.update(s)

            print("\n" + "=" * 50)
            print("✅ Vectorization complete")
            print(f"📁 Saved to: {output_path}")
            if args.combine_all:
                print("📊 Combined FAISS index created")
            else:
                print("📊 Vector stores created by file type:")
                for file_type in stores:
                    print(f"  • {file_type}")
            print("=" * 50)

    except Exception as e:
        log.exception("❌ Vectorization failed")
        exit(1)


if __name__ == "__main__":
    main()