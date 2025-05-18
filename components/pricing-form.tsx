"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface PricingFormProps {
  formData: {
    price: string
    mintingFee: string
    royaltyPercentage: string
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (name: string, value: string) => void
}

export function PricingForm({ formData, onChange, onSelectChange }: PricingFormProps) {
  const handleRoyaltyChange = (value: number[]) => {
    onSelectChange("royaltyPercentage", value[0].toString())
  }

  // Calculate estimated earnings
  const price = Number.parseFloat(formData.price) || 0
  const mintingFee = Number.parseFloat(formData.mintingFee) || 0
  const royaltyPercentage = Number.parseFloat(formData.royaltyPercentage) || 0

  const initialEarnings = price - mintingFee
  const estimatedRoyalties = price * (royaltyPercentage / 100) * 10 // Assuming 10 secondary sales

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="price">Price in XRP</Label>
            <div className="relative">
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 100"
                value={formData.price}
                onChange={onChange}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-muted-foreground">XRP</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Set a competitive price for your masterclass NFT</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mintingFee">Minting Fee (XRP)</Label>
            <div className="relative">
              <Input
                id="mintingFee"
                name="mintingFee"
                type="number"
                min="0.001"
                step="0.001"
                value={formData.mintingFee}
                onChange={onChange}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-muted-foreground">XRP</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Standard fee for minting on the XRP Ledger</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="royaltyPercentage">Royalty Percentage</Label>
              <span className="text-sm font-medium">{formData.royaltyPercentage}%</span>
            </div>
            <Slider
              id="royaltyPercentage"
              min={0}
              max={15}
              step={0.5}
              value={[Number.parseFloat(formData.royaltyPercentage)]}
              onValueChange={handleRoyaltyChange}
            />
            <p className="text-xs text-muted-foreground">
              Percentage you'll earn from secondary sales (recommended: 5-10%)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="limitedEdition">Limited Edition</Label>
              <Switch id="limitedEdition" />
            </div>
            <p className="text-xs text-muted-foreground">Create a limited number of NFTs for exclusivity</p>
          </div>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-lg mb-4">Earnings Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NFT Price</span>
                  <span>{price.toFixed(2)} XRP</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minting Fee</span>
                  <span>-{mintingFee.toFixed(3)} XRP</span>
                </div>

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Initial Earnings</span>
                  <span>{initialEarnings.toFixed(2)} XRP</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Royalties</span>
                  <span>+{estimatedRoyalties.toFixed(2)} XRP</span>
                </div>

                <div className="bg-secondary p-4 rounded-lg mt-4">
                  <div className="flex justify-between font-medium">
                    <span>Potential Total Earnings</span>
                    <span>{(initialEarnings + estimatedRoyalties).toFixed(2)} XRP</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on initial sale plus estimated royalties from 10 secondary sales
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-2">XRP Ledger Benefits</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-primary shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Fast transactions (3-5 seconds)</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-primary shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Low carbon footprint</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-primary shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Minimal transaction fees</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
