// ================== helpers ==================
const isEmpty = (v) => !v || !v.trim();

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isFutureDate = (date) => {
  if (!date) return false;
  return new Date(date) > new Date();
};

// ================== CERTIFICATION ==================
export const validateCertification = (cert) => {
  const errors = {};

  if (isEmpty(cert.name)) {
    errors.name = "Certification name is required";
  } else if (cert.name.length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  if (isEmpty(cert.issuingOrganization)) {
    errors.issuingOrganization = "Issuing organization is required";
  }

  if (cert.issueDate && isFutureDate(cert.issueDate)) {
    errors.issueDate = "Issue date cannot be in the future";
  }

  if (cert.credentialUrl && !isValidUrl(cert.credentialUrl)) {
    errors.credentialUrl = "Enter a valid URL";
  }

  return errors;
};

// ================== PROJECT ==================
export const validateProject = (proj) => {
  const errors = {};

  if (isEmpty(proj.name)) {
    errors.name = "Project name is required";
  } else if (proj.name.length < 3) {
    errors.name = "Project name must be at least 3 characters";
  }

  if (proj.description && proj.description.length < 20) {
    errors.description = "Description should be at least 20 characters";
  }

  if (proj.link && !isValidUrl(proj.link)) {
    errors.link = "Enter a valid project URL";
  }

  if (proj.technologies) {
    const techs = proj.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (techs.length === 0) {
      errors.technologies = "Add at least one technology";
    }
  }

  return errors;
};
