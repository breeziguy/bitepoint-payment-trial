import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderSummary from "./OrderSummary";
import { supabase } from "@/integrations/supabase/client";

export interface CheckoutFormData {
  name: string;
  whatsapp: string;
  deliveryType: "pickup" | "delivery";
  streetAddress?: string;
  unitNumber?: string;
  deliveryZoneId?: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  price: number;
}

interface CheckoutFormProps {
  formData: CheckoutFormData;
  onFormChange: (data: Partial<CheckoutFormData>) => void;
  onSubmit: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const CheckoutForm = ({
  formData,
  onFormChange,
  onSubmit,
  subtotal,
  deliveryFee,
  total,
}: CheckoutFormProps) => {
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  useEffect(() => {
    const fetchDeliveryZones = async () => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .order("name");
      if (error) {
        // Generic error without exposing details
        console.error("Error fetching delivery zones");
        return;
      }
      if (data) {
        setDeliveryZones(data);
      }
    };
    fetchDeliveryZones();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>WhatsApp number</Label>
          <Input
            placeholder="Your WhatsApp number"
            value={formData.whatsapp}
            onChange={(e) => onFormChange({ whatsapp: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Delivery</Label>
          <RadioGroup
            value={formData.deliveryType}
            onValueChange={(value: "pickup" | "delivery") =>
              onFormChange({ deliveryType: value, deliveryZoneId: undefined })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup">Pickup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery">Home delivery</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.deliveryType === "delivery" && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label>Delivery Zone</Label>
              <Select
                value={formData.deliveryZoneId}
                onValueChange={(value) => onFormChange({ deliveryZoneId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your area" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} - ₦{zone.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Street address</Label>
              <Input
                placeholder="Enter your street address"
                value={formData.streetAddress}
                onChange={(e) => onFormChange({ streetAddress: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Apartment, unit number, suite, etc. (optional)</Label>
              <Input
                placeholder="Unit number (optional)"
                value={formData.unitNumber}
                onChange={(e) => onFormChange({ unitNumber: e.target.value })}
              />
            </div>
          </div>
        )}

        <OrderSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          deliveryType={formData.deliveryType}
        />
      </div>

      <Button
        className="w-full bg-[#FEF7CD] hover:bg-[#FEF7CD]/90 text-black"
        onClick={onSubmit}
      >
        Make Payment
      </Button>
    </div>
  );
};

export default CheckoutForm;