export type CustomerValidationErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

export function normalizeCustomerName(
  value: string
) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeEmail(
  value: string
) {
  return value.trim().toLowerCase();
}

export function normalizePhone(
  value: string
) {
  return value.replace(/\D/g, "");
}

export function formatPhoneForStorage(
  value: string
) {
  const digits = normalizePhone(value);

  if (digits.length === 10) {
    return `(${digits.slice(
      0,
      3
    )}) ${digits.slice(
      3,
      6
    )}-${digits.slice(6)}`;
  }

  if (
    digits.length === 11 &&
    digits.startsWith("1")
  ) {
    return `(${digits.slice(
      1,
      4
    )}) ${digits.slice(
      4,
      7
    )}-${digits.slice(7)}`;
  }

  return value.trim();
}

export function isValidEmail(
  value: string
) {
  const email = normalizeEmail(value);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export function isValidPhone(
  value: string
) {
  const digits = normalizePhone(value);

  return (
    digits.length === 10 ||
    (digits.length === 11 &&
      digits.startsWith("1"))
  );
}

export function validateCustomerInfo({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string;
}) {
  const errors: CustomerValidationErrors =
    {};

  const normalizedName =
    normalizeCustomerName(name);

  if (!normalizedName) {
    errors.name = "Name is required.";
  } else if (normalizedName.length < 2) {
    errors.name =
      "Please enter a valid name.";
  } else if (normalizedName.length > 100) {
    errors.name = "Name is too long.";
  }

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email =
      "Please enter a valid email address.";
  }

  if (!phone.trim()) {
    errors.phone = "Phone is required.";
  } else if (!isValidPhone(phone)) {
    errors.phone =
      "Please enter a valid 10-digit phone number.";
  }

  return {
    valid:
      Object.keys(errors).length === 0,
    errors,
    normalized: {
      name: normalizedName,
      email: normalizeEmail(email),
      phone: formatPhoneForStorage(phone),
    },
  };
}