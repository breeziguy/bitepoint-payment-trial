import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import OrderSummary from "./OrderSummary";

export interface CheckoutFormData {
  name: string;
  whatsapp: string;
  deliveryType: "pickup" | "delivery";
  streetAddress?: string;
  unitNumber?: string;
  city?: string;
  postalCode?: string;
}

interface CheckoutFormProps {
  formData: CheckoutFormData;
  onFormChange: (data: Partial<CheckoutFormData>) => void;
  onSubmit: () => void;
  subtotal: number;
  others: number;
  deliveryFee: number;
  total: number;
  tax: number;
  finalTotal: number;
}

const CheckoutForm = ({
  formData,
  onFormChange,
  onSubmit,
  subtotal,
  others,
  deliveryFee,
  total,
  tax,
  finalTotal,
}: CheckoutFormProps) => {
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
              onFormChange({ deliveryType: value })
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
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                placeholder="Enter city"
                value={formData.city}
                onChange={(e) => onFormChange({ city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Postal code</Label>
              <Input
                placeholder="Enter postal code"
                value={formData.postalCode}
                onChange={(e) => onFormChange({ postalCode: e.target.value })}
              />
            </div>
          </div>
        )}

        <OrderSummary
          subtotal={subtotal}
          others={others}
          deliveryFee={deliveryFee}
          total={total}
          tax={tax}
          finalTotal={finalTotal}
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