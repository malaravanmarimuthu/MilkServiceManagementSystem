export const validatePatient = (
  name: string,
  age: string,
  type: string,
  oldPatient?:{
    name: string,
  age: string,
  type: string,
  }
) => {

  const errors = {

    name: "",

    age: "",

    type: "",

    info: "",
  };

  let valid = true;

  // NAME

  if (!name.trim()) {

    errors.name = "Name is required";

    valid = false;
  }

  // AGE

  if (!age.trim()) {

    errors.age = "Age is required";

    valid = false;
  }

  // TYPE

  if (!type.trim()) {

    errors.type = "Type is required";

    valid = false;
  }

  return {

    errors,

    valid,
  };
};