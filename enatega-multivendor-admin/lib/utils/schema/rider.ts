import * as Yup from 'yup';

export const RiderSchema = Yup.object().shape({
  name: Yup.string()
    .max(35)
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Required'),
  username: Yup.string().min(2).max(35).required('Required'),
    password: Yup.string()
    .required('Required')
    .min(6, 'At least 6 characters')
    .matches(/[a-z]/, 'At least one lowercase letter (a-z)')
    .matches(/[A-Z]/, 'At least one uppercase letter (A-Z)')
    .matches(/[0-9]/, 'At least one number (0-9)')
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'At least one special character'),
  confirmPassword: Yup.string()
    .nullable()
    .oneOf([Yup.ref('password'), null], 'Password must match')
    .required('Required'),
  zone: Yup.object()
    .shape({
      label: Yup.string().required('Required'),
      code: Yup.string().required('Required'),
    })
    .required('Required'),
  phone: Yup.string().required('Required').min(5,"Minimum 5 Numbers are Required"),
  vehicleType: Yup.object()
    .shape({
      label: Yup.string().required('Required'),
      code: Yup.string().required('Required'),
    })
    .required('Required'),
});

// Vendor-managed riders are distributed by store assignment rather than by
// zone, so at least one store is required and the zone is optional.
export const VendorRiderSchema = Yup.object().shape({
  name: Yup.string()
    .max(35)
    .trim()
    .matches(/\S/, 'Name cannot be only spaces')
    .required('Required'),
  username: Yup.string().min(2).max(35).required('Required'),
  password: Yup.string()
    .required('Required')
    .min(6, 'At least 6 characters')
    .matches(/[a-z]/, 'At least one lowercase letter (a-z)')
    .matches(/[A-Z]/, 'At least one uppercase letter (A-Z)')
    .matches(/[0-9]/, 'At least one number (0-9)')
    .matches(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      'At least one special character'
    ),
  confirmPassword: Yup.string()
    .nullable()
    .oneOf([Yup.ref('password'), null], 'Password must match')
    .required('Required'),
  phone: Yup.string()
    .required('Required')
    .min(5, 'Minimum 5 Numbers are Required'),
  vehicleType: Yup.object()
    .shape({
      label: Yup.string().required('Required'),
      code: Yup.string().required('Required'),
    })
    .required('Required'),
  assignedStores: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string().required(),
        code: Yup.string().required(),
      })
    )
    .min(1, 'Assign at least one store')
    .required('Assign at least one store'),
});

// Same as above but for editing, where leaving the password blank keeps it.
export const VendorRiderEditSchema = VendorRiderSchema.shape({
  password: Yup.string()
    .min(6, 'At least 6 characters')
    .matches(/[a-z]/, 'At least one lowercase letter (a-z)')
    .matches(/[A-Z]/, 'At least one uppercase letter (A-Z)')
    .matches(/[0-9]/, 'At least one number (0-9)')
    .matches(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      'At least one special character'
    )
    .nullable()
    .notRequired(),
  confirmPassword: Yup.string()
    .nullable()
    .oneOf([Yup.ref('password'), null, ''], 'Password must match')
    .notRequired(),
});
