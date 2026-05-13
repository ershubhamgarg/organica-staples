export const BRAND = {
  name: "Amritya Organics",
  whatsappPhone: "918295433041",
  supportEmail: "bilonanaturals@gmail.com",
  instagramUrl: "https://www.instagram.com/organicastaples/",
  freeShippingThreshold: 500,
  shippingFee: 50,
  heroImage:
    "https://qdrkqtcbninswzieszfx.supabase.co/storage/v1/object/sign/images/ChatGPT%20Image%20May%207,%202026,%2009_51_47%20AM.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85YWMzMTk3Ny0wZTk5LTQ1NjQtODM2OC1iM2IzZTQzMzIyNDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvQ2hhdEdQVCBJbWFnZSBNYXkgNywgMjAyNiwgMDlfNTFfNDcgQU0ucG5nIiwiaWF0IjoxNzc4MTI3NzIyLCJleHAiOjE4MDk2NjM3MjJ9.wG0Mdodjvtd8fKToIpBI2z3mRjfgi4ZnxXWxNwb3wFI",
} as const;

export const NUTRITION_FACTS = [
  { label: "Energy", value: "364 kcal" },
  { label: "Protein", value: "12.5g" },
  { label: "Carbs", value: "71.2g" },
  { label: "Fibre", value: "10.8g" },
] as const;

export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI" },
  { id: "cod", label: "Cash on Delivery" },
] as const;
