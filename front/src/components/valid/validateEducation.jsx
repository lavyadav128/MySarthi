const validateEducation = (data) => {
  const newErrors = {};

  if (!data.school?.trim()) {
    newErrors.school = "School/College is required";
  }

  if (!data.degree?.trim()) {
    newErrors.degree = "Degree is required";
  }

  if (!data.fieldOfStudy?.trim()) {
    newErrors.fieldOfStudy = "Field of study is required";
  }

  if (!data.startDate) {
    newErrors.startDate = "Start date is required";
  }

  if (!data.endDate) {
    newErrors.endDate = "End date is required";
  }

  if (data.startDate && data.endDate) {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      newErrors.endDate = "End date cannot be before start date";
    }
  }

  // if (!data.description?.trim()) {
  //   newErrors.description = "Description is required";
  // }

  return newErrors;
};

export default validateEducation;
