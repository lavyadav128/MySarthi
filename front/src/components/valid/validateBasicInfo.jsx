const validateBasicInfo = (local) => {
  const errors = {};

  // Name
  if (!local.name.trim()) {
    errors.name = "Full name is required";
  } else if (local.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  // Profession
  // if (!local.profession) {
  //   errors.profession = "Profession is required";
  // }

  // Headline
  if (!local.headline.trim()) {
    errors.headline = "Headline is required";
  } else if (local.headline.length < 10) {
    errors.headline = "Headline must be at least 10 characters";
  }

  // About
  if (!local.about.trim()) {
    errors.about = "About section is required";
  } else if (local.about.length < 30) {
    errors.about = "About must be at least 30 characters";
  }

  // Country
  if (!local.country.trim()) {
    errors.country = "Country is required";
  }

  // City
  if (!local.city.trim()) {
    errors.city = "City is required";
  }

  return errors;
};

export default validateBasicInfo;