// Core
import { Form, Formik, FormikHelpers } from 'formik';
import { useContext, useMemo } from 'react';

// Prime React
import { Sidebar } from 'primereact/sidebar';

// Interface and Types
import { IQueryResult, IDropdownSelectItem } from '@/lib/utils/interfaces';
import { IRiderForm } from '@/lib/utils/interfaces/forms';
import { IRiderResponse } from '@/lib/utils/interfaces/rider.interface';
import { IRestaurantsByOwnerResponseGraphQL } from '@/lib/utils/interfaces';
import { TSideBarFormPosition } from '@/lib/utils/types/sidebar';

// Components
import CustomButton from '@/lib/ui/useable-components/button';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import CustomMultiSelectComponent from '@/lib/ui/useable-components/custom-multi-select';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';
import CustomPhoneTextField from '@/lib/ui/useable-components/phone-input-field';

// Utilities and Constants
import { RiderErrors, VEHICLE_TYPE } from '@/lib/utils/constants';
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';
import { VendorRiderEditSchema, VendorRiderSchema } from '@/lib/utils/schema/rider';

// Hooks
import useToast from '@/lib/hooks/useToast';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import { useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';

// Context
import { VendorLayoutContext } from '@/lib/context/vendor/layout-vendor.context';

// GraphQL
import {
  CREATE_RIDER,
  EDIT_RIDER,
  GET_RESTAURANTS_BY_OWNER,
} from '@/lib/api/graphql';

interface IVendorRiderAddFormProps {
  position?: TSideBarFormPosition;
  isAddRiderVisible: boolean;
  onHide: () => void;
  rider: IRiderResponse | null;
}

/**
 * Create / edit a rider that belongs to the signed-in vendor.
 *
 * Unlike the platform rider form, distribution here is driven by the stores the
 * rider is assigned to rather than by a delivery zone — a rider only ever
 * receives orders originating from the stores selected below.
 */
export default function VendorRiderAddForm({
  onHide,
  rider,
  position = 'right',
  isAddRiderVisible,
}: IVendorRiderAddFormProps) {
  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  // Context
  const {
    vendorLayoutContextData: { vendorId },
  } = useContext(VendorLayoutContext);

  // Query — the vendor's own stores are the only assignable ones.
  const { data: storesData, loading: storesLoading } = useQueryGQL(
    GET_RESTAURANTS_BY_OWNER,
    { id: vendorId },
    { enabled: !!vendorId, fetchPolicy: 'cache-and-network' }
  ) as IQueryResult<IRestaurantsByOwnerResponseGraphQL | undefined, undefined>;

  const storeOptions: IDropdownSelectItem[] = useMemo(
    () =>
      (storesData?.restaurantByOwner?.restaurants ?? []).map((store) => ({
        label: store.name,
        code: store._id,
      })),
    [storesData]
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
    zone: rider?.zone ? { label: rider.zone.title, code: rider.zone._id } : null,
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

  const handleSubmit = (
    values: IRiderForm,
    { resetForm }: FormikHelpers<IRiderForm>
  ) => {
    mutate({
      variables: {
        riderInput: {
          _id: rider ? rider._id : '',
          name: values.name,
          username: values.username,
          phone: values.phone?.toString(),
          vehicleType: values.vehicleType?.code,
          available: rider ? rider.available : true,
          assignedStores: (values.assignedStores ?? []).map(
            (store) => store.code
          ),
          ...(values.zone?.code ? { zone: values.zone.code } : {}),
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
                validationSchema={rider ? VendorRiderEditSchema : VendorRiderSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                validateOnChange={false}
                validateOnBlur={false}
              >
                {({
                  values,
                  errors,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  setFieldTouched,
                  touched,
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

                        {/* Store assignment drives which orders this rider is
                            offered — one rider may serve several stores. */}
                        <CustomMultiSelectComponent
                          name="assignedStores"
                          placeholder={t('Assigned Stores')}
                          showLabel={true}
                          isLoading={storesLoading}
                          options={storeOptions}
                          selectedItems={values.assignedStores ?? []}
                          setSelectedItems={setFieldValue}
                          style={{
                            borderColor: errors?.assignedStores ? 'red' : '',
                          }}
                        />

                        <CustomPhoneTextField
                          type="text"
                          mask="999-999-9999"
                          placeholder={t('Phone Number')}
                          name="phone"
                          showLabel={true}
                          value={values?.phone?.toString()}
                          onChange={(code: string) => {
                            setFieldValue('phone', code);
                            setFieldTouched('phone', true, false);
                          }}
                          style={{
                            borderColor:
                              onErrorMessageMatcher(
                                'phone',
                                errors?.phone,
                                RiderErrors
                              ) && touched?.phone
                                ? 'red'
                                : '',
                          }}
                        />

                        <div className="mt-4 flex justify-end">
                          <CustomButton
                            className="h-10 w-fit border-gray-300 border dark:border-dark-600 bg-black px-8 text-white"
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
