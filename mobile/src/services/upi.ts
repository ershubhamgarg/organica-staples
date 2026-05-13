export async function verifyVpa(vpa: string) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const normalized = vpa.trim().toLowerCase();
  const isValid = /^[a-z0-9.\-_]{2,}@[a-z]{2,}$/i.test(normalized);

  if (!isValid) {
    return {
      success: false,
      error: "Invalid UPI ID. Try something like name@upi.",
    };
  }

  return {
    success: true,
    name: normalized.split("@")[0].replace(/[._-]/g, " ").toUpperCase(),
  };
}
