import * as Yup from 'yup';

// A rider belongs to a vendor when the vendor dropdown carries an id — the
// empty `code` is the "Platform" option the super admin picks for a rider that
// is not tied to any vendor.
const hasVendor = (vendor: { code?: string } | null | undefined) =>
  !!vendor?.code;

// Password rules for an edit, where leaving the field blank keeps the rider's
// existing credentials. The empty string is transformed away first, otherwise
// yup runs the strength rules against it and reports a blank field as weak.
const optionalPassword = () =>
  Yup.string()
    .transform((value) => (value === '' ? undefined : value))
    .min(6, 'At least 6 characters')
    .matches(/[a-z]/, 'At least one lowercase letter (a-z)')
    .matches(/[A-Z]/, 'At least one uppercase letter (A-Z)')
    .matches(/[0-9]/, 'At least one number (0-9)')
    .matches(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      'At least one special character'
    )
    .nullable()
    .notRequired();

/**
 * Super admin rider form.
 *
 * A platform rider is dispatched by zone, so the zone is required. A rider
 * handed to a vendor is dispatched by store assignment instead, so the zone
 * becomes optional and at least one of that vendor's stores must be picked.
 */
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
    .nullable()
    .when('vendor', {
      is: hasVendor,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required('Required'),
    }),
  phone: Yup.string().required('Required').min(5,"Minimum 5 Numbers are Required"),
  vehicleType: Yup.object()
    .shape({
      label: Yup.string().required('Required'),
      code: Yup.string().required('Required'),
    })
    .required('Required'),
  vendor: Yup.object()
    .shape({
      label: Yup.string(),
      code: Yup.string(),
    })
    .nullable()
    .notRequired(),
  assignedStores: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string().required(),
        code: Yup.string().required(),
      })
    )
    .when('vendor', {
      is: hasVendor,
      then: (schema) =>
        schema
          .min(1, 'Assign at least one store')
          .required('Assign at least one store'),
      otherwise: (schema) => schema.notRequired(),
    }),
});

// Editing keeps the password optional — leaving both fields blank preserves the
// rider's existing credentials.
export const RiderEditSchema = RiderSchema.shape({
  password: optionalPassword(),
  confirmPassword: Yup.string()
    .nullable()
    .oneOf([Yup.ref('password'), null, ''], 'Password must match')
    .notRequired(),
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
  password: optionalPassword(),
  confirmPassword: Yup.string()
    .nullable()
    .oneOf([Yup.ref('password'), null, ''], 'Password must match')
    .notRequired(),
});
