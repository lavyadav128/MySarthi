const validateExperience = (data) => {
  const newErrors = {};

  if (!data.title?.trim()) {
    newErrors.title = "Job title is required";
  }

  if (!data.company?.trim()) {
    newErrors.company = "Company name is required";
  }

//   if (!data.startDate) {
//     newErrors.startDate = "Start date is required";
//   }

//   // End date rules
//   if (!data.currentlyWorking) {
//     if (!data.endDate) {
//       newErrors.endDate = "End date is required";
//     } else if (new Date(data.endDate) < new Date(data.startDate)) {
//       newErrors.endDate = "End date cannot be before start date";
//     }
//   }

//   if (!data.location?.trim()) {
//     newErrors.location = "Location is required";
//   }

//   if (!data.description?.trim()) {
//     newErrors.description = "Description is required";
//   }

  return newErrors;
};

export default validateExperience;