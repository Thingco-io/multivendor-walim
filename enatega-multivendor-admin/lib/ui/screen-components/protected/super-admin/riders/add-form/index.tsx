// Core
import { Form, Formik, FormikHelpers } from 'formik';
import { useMemo } from 'react';

// Prime React
import { Sidebar } from 'primereact/sidebar';

// Interface and Types
import { IDropdownSelectItem, IQueryResult } from '@/lib/utils/interfaces';
import { IRiderForm } from '@/lib/utils/interfaces/forms';
import {
  IRidersAddFormComponentProps,
  IRiderZonesResponse,
  IRestaurantsByOwnerResponseGraphQL,
  IVendorResponseGraphQL,
} from '@/lib/utils/interfaces';

// Components
import CustomButton from '@/lib/ui/useable-components/button';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import CustomMultiSelectComponent from '@/lib/ui/useable-components/custom-multi-select';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';

// Utilities and Constants
import {
  RiderErrors /* , VEHICLE_TYPE  */,
  VEHICLE_TYPE,
} from '@/lib/utils/constants';
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';
import { RiderEditSchema, RiderSchema } from '@/lib/utils/schema/rider';

//Toast
import useToast from '@/lib/hooks/useToast';

//GraphQL
import {
  CREATE_RIDER,
  EDIT_RIDER,
  GET_RESTAURANTS_BY_OWNER,
  GET_VENDORS,
  GET_ZONES,
} from '@/lib/api/graphql';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import { useMutation } from '@apollo/client';
import CustomPhoneTextField from '@/lib/ui/useable-components/phone-input-field';
import { useTranslations } from 'next-intl';

// A rider that is not handed to a vendor stays on the platform and keeps the
// legacy zone-based dispatch.
const PLATFORM_VENDOR_CODE = '';

export default function RiderAddForm({
  onHide,
  rider,
  position = 'right',
  isAddRiderVisible,
}: IRidersAddFormComponentProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // Query
  const { data } = useQueryGQL(
    GET_ZONES,
    {},
    { fetchPolicy: 'cache-and-network' }
  ) as IQueryResult<IRiderZonesResponse | undefined, undefined>;

  const { data: vendorsData, loading: vendorsLoading } = useQueryGQL(
    GET_VENDORS,
    {},
    { fetchPolicy: 'cache-and-network' }
  ) as IQueryResult<IVendorResponseGraphQL | undefined, undefined>;

  const vendorOptions: IDropdownSelectItem[] = useMemo(
    () => [
      { label: t('Platform (No Vendor)'), code: PLATFORM_VENDOR_CODE },
      ...(vendorsData?.vendors ?? []).map((vendor) => ({
        label: vendor.name || vendor.email,
        code: vendor._id,
      })),
    ],
    [vendorsData, t]
  );

  const initialValues: IRiderForm = {
    name: '',
    username: '',
    password: '',
    ...rider,
    vehicleType: rider
      ? VEHICLE_TYPE.find((vt) => vt?.code === rider?.vehicleType) || null
      : null,
    confirmPassword: '',
    phone: rider ? +rider.phone : null,
    zone: rider?.zone
      ? { label: rider.zone.title, code: rider.zone._id }
      : null,
    vendor: rider?.vendor?._id
      ? {
          label: rider.vendor.name || rider.vendor.email || '',
          code: rider.vendor._id,
        }
      : { label: t('Platform (No Vendor)'), code: PLATFORM_VENDOR_CODE },
    assignedStores:
      rider?.assignedStores?.map((store) => ({
        label: store.name,
        code: store._id,
      })) ?? [],
  };

  // Mutation
  const mutation = rider ? EDIT_RIDER : CREATE_RIDER;
  const [mutate, { loading: mutationLoading }] = useMutation(mutation, {
    refetchQueries: 'active',
    awaitRefetchQueries: true,
  });

  // Form Submission
  const handleSubmit = (
    values: IRiderForm,
    { resetForm }: FormikHelpers<IRiderForm>
  ) => {
    const vendorId = values.vendor?.code || null;

    mutate({
      variables: {
        riderInput: {
          _id: rider ? rider._id : '',
          name: values.name,
          username: values.username,
          phone: values.phone?.toString(),
          zone: values.zone?.code || null,
          vehicleType: values.vehicleType?.code,
          available: rider ? rider.available : true,
          vendor: vendorId,
          // Store assignment only means something for a vendor's rider — a
          // platform rider is dispatched by zone.
          assignedStores: vendorId
            ? (values.assignedStores ?? []).map((store) => store.code)
            : [],
          ...(values.password ? { password: values.password } : {}),
        },
      },
      onCompleted: () => {
        showToast({
          type: 'success',
          title: t('Success'),
          message: rider ? t('Rider updated') : t('Rider added'),
          duration: 3000,
        });
        resetForm();
        onHide();
      },
      onError: (error) => {
        let message = '';
        try {
          message = error.graphQLErrors[0]?.message;
        } catch (err) {
          message = t('ActionFailedTryAgain');
        }
        showToast({
          type: 'error',
          title: t('Error'),
          message,
          duration: 3000,
        });
      },
    });
  };

  return (
    <Sidebar
      visible={isAddRiderVisible}
      position={position}
      onHide={onHide}
      className="w-full sm:w-[450px] dark:text-white dark:bg-dark-950 border dark:border-dark-600"
    >
      <div className="flex h-full w-full items-center justify-start">
        <div className="h-full w-full">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex flex-col">
              <span className="text-lg">
                {rider ? t('Edit') : t('Add')} {t('Rider')}
              </span>
            </div>

            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={rider ? RiderEditSchema : RiderSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                validateOnChange={false} // Disable validation on change
                validateOnBlur={false} // Disable validation on blur
              >
                {({
                  values,
                  errors,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched ,
                  touched
                }) => {
                  return (
                    <Form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <CustomTextField
                          type="text"
                          name="name"
                          placeholder={t('Name')}
                          maxLength={35}
                          value={values.name}
                          onChange={handleChange}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'name',
                              errors?.name,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomTextField
                          type="text"
                          name="username"
                          placeholder={t('Username')}
                          maxLength={35}
                          value={values.username}
                          onChange={handleChange}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'username',
                              errors?.username,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomPasswordTextField
                          placeholder={t('Password')}
                          name="password"
                          maxLength={20}
                          value={values.password}
                          showLabel={true}
                          onChange={handleChange}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'password',
                              errors?.password,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomPasswordTextField
                          placeholder={t('Confirm Password')}
                          name="confirmPassword"
                          maxLength={20}
                          showLabel={true}
                          value={values.confirmPassword ?? ''}
                          onChange={handleChange}
                          feedback={false}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'confirmPassword',
                              errors?.confirmPassword,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomDropdownComponent
                          placeholder={t('Vehicle Type')}
                          options={VEHICLE_TYPE}
                          showLabel={true}
                          name="vehicleType"
                          selectedItem={values.vehicleType}
                          setSelectedItem={setFieldValue}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'vehicleType',
                              errors?.vehicleType,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        {/* Handing the rider to a vendor switches dispatch from
                            zone-wide to the vendor's selected stores. */}
                        <CustomDropdownComponent
                          placeholder={t('Vendor')}
                          options={vendorOptions}
                          showLabel={true}
                          isLoading={vendorsLoading && !vendorsData}
                          name="vendor"
                          selectedItem={values.vendor ?? null}
                          setSelectedItem={(
                            name: string,
                            value: IDropdownSelectItem
                          ) => {
                            setFieldValue(name, value);
                            // Stores belong to a single vendor, so a change of
                            // vendor invalidates whatever was selected.
                            setFieldValue('assignedStores', []);
                          }}
                          style={{
                            borderColor: errors?.vendor ? 'red' : '',
                          }}
                        />

                        <VendorStoresField
                          vendorId={values.vendor?.code || ''}
                          selectedStores={values.assignedStores ?? []}
                          setFieldValue={setFieldValue}
                          hasError={!!errors?.assignedStores}
                        />

                        <CustomDropdownComponent
                          placeholder={t('Zone')}
                          options={
                            data?.zones.map((val) => {
                              return { label: val.title, code: val._id };
                            }) || []
                          }
                          showLabel={true}
                          name="zone"
                          selectedItem={values.zone}
                          setSelectedItem={setFieldValue}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'zone',
                              errors?.zone,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomPhoneTextField
                          type="text"
                          mask="999-999-9999"
                          placeholder={t('Phone Number')}
                          name="phone"
                          showLabel={true}
                          value={values?.phone?.toString()}
                          // onChange={(code: string) => {
                          //   setFieldValue('phone', code);
                          // }}
                          onChange={(code: string) => {
                            setFieldValue('phone', code);
                            setFieldTouched('phone', true, false); // Mark as touched immediately
                          }}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'phone',
                              errors?.phone,
                              RiderErrors
                            ) && touched?.phone ? 'red' : '',
                          }}
                        />

                        <div className="mt-4 flex justify-end">
                          <CustomButton
                            className="h-10 w-fit border-gray-300 border dark:border-dark-600 bg-black  px-8 text-white"
                            label={rider ? t('Update') : t('Add')}
                            type="submit"
                            loading={mutationLoading}
                          />
                        </div>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

/**
 * Store picker for the vendor selected above.
 *
 * Split into its own component so the stores query re-runs on the selected
 * vendor without the whole form re-rendering against a stale owner id. Renders
 * nothing for a platform rider, which has no vendor and therefore no stores.
 */
function VendorStoresField({
  vendorId,
  selectedStores,
  setFieldValue,
  hasError,
}: {
  vendorId: string;
  selectedStores: IDropdownSelectItem[];
  setFieldValue: (field: string, value: unknown) => void;
  hasError: boolean;
}) {
  const t = useTranslations();

  const { data, loading } = useQueryGQL(
    GET_RESTAURANTS_BY_OWNER,
    { id: vendorId },
    { enabled: !!vendorId, fetchPolicy: 'cache-and-network' }
  ) as IQueryResult<IRestaurantsByOwnerResponseGraphQL | undefined, undefined>;

  const storeOptions: IDropdownSelectItem[] = useMemo(
    () =>
      (data?.restaurantByOwner?.restaurants ?? []).map((store) => ({
        label: store.name,
        code: store._id,
      })),
    [data]
  );

  if (!vendorId) return null;

  return (
    <CustomMultiSelectComponent
      name="assignedStores"
      placeholder={t('Assigned Stores')}
      showLabel={true}
      isLoading={loading && !data}
      options={storeOptions}
      selectedItems={selectedStores}
      setSelectedItems={setFieldValue}
      style={{ borderColor: hasError ? 'red' : '' }}
    />
  );
}
