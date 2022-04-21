import { FC, useEffect, useState } from 'react';

// components
import ModalUsersContent from './ModalUsersContent';
import ModalRolesContent from './ModalEditRolesContent';

// ui
import 'antd/dist/antd.css';
import { message } from 'antd';

//utils
import customAxios from '../../utils/customAxios';
import resolveError from '../../utils/resolveError';

// config
import apiRoutes from '../../config/apiRoutes';

// types
import { ModalEditProps, FinishEditType, RolesType, FormInitialValues } from './types';

// styles
import './ModalEdit.scss';

const ModalEdit: FC<ModalEditProps> = ({
  onCreateClickHandler,
  onChangeClickHandler,
  getUsers,
  getRoles,
  isCreate,
  changeUserData,
  changeRolesData,
  roles,
  rightsModules,
  statuses,
  pageName,
}) => {

  const [changeData, setChangeData] = useState<RolesType | undefined>();
  const [formInitValue, setFormInitValue] = useState<FormInitialValues | undefined>();
  const [, forceUpdate] = useState({});
  const isUserPage = pageName === 'users';

  const onFinishFailed = (errorInfo: any) => {
    message.error(errorInfo + ' ' + errorInfo);
  };

  const onCancelClickHandler = () => {
    if (isCreate) {
      onCreateClickHandler && onCreateClickHandler(false);
    } else {
      onChangeClickHandler && onChangeClickHandler(false);
    }
  };

  const removeHandler = async () => {
    try {
      if (isUserPage) {
        await customAxios.delete(apiRoutes.USERS + changeUserData?.id);
      }
      else {
        await customAxios.delete(apiRoutes.ROLES + changeRolesData?.id);
      }
    } catch (error: any) {
      message.error(resolveError(error.response));
    } finally {
      if (isUserPage) {
        getUsers && getUsers();
      } else {
        getRoles && getRoles();
      }
      message.success(
        isUserPage
          ? `Пользователь ${changeUserData?.login} удалён`
          : `Роль ${changeRolesData?.name} удалена`,
      );
      setTimeout(() => {
        onCancelClickHandler();
      }, 100);
    }
  };

  const postBodyData = (values: FinishEditType) => {
    if (isUserPage) {
      return {
        id: isCreate ? null : changeUserData?.id,
        description: values.description,
        login: values.login,
        role: {
          id: values.roleSelect,
        },
        status: {
          id: values.statusSelect,
        },
      };
    } else {
      const moduleNames = rightsModules?.map((rightModule: any) => {
        const moduleName = rightModule.authorities[0].name.substring(
          rightModule.authorities[0].name.indexOf('_') + 1,
          rightModule.authorities[0].name.lastIndexOf('_')
        ).toLowerCase();

        return moduleName;
      });

      let selectedSettings: any[] = [];

      moduleNames?.forEach((moduleName) => {
        for (const [key, value] of Object.entries(values)) {
          if (key === `${moduleName}Select`) {
            selectedSettings.push(value);
          }
        }
      });

      return {
        authorityModules: roles && roles[0].authorityModules?.map((rightModule, key) => {
          return {
            id: rightModule.id,
            name: rightModule.name,
            authorities: rightModule.authorities.map(element => {
              return {
                id: element.id,
                name: element.name,
                selected: selectedSettings[key].includes(element.name),
                title: element.title
              }
            })
          }
        }),
        description: values?.description,
        id: isCreate ? null : changeData?.id,
        name: values.name,
      }
    }

  };

  const createSelectedArray = (array: RolesType | undefined, elementId: number) => {
    if (array?.authorityModules) {
      const authModule: any = array.authorityModules.filter((element) => element.id === elementId);

      const result = authModule[0]?.authorities?.map((element: any) => {
        if (element.selected) {
          return element.name
        }

        return null;
      });

      return result.filter((elem: any) => elem !== null)
    }
  };

  const formInitialValues = (): FormInitialValues | undefined => {
    if (isUserPage && changeUserData) {
      return {
        statusSelect: changeUserData?.status.id,
        login: changeUserData?.login,
        description: changeUserData?.description,
        roleSelect: changeUserData?.role.id,
      };
    } else if (!isUserPage && changeRolesData) {
      const modulesObject: any = {
        name: changeRolesData?.name,
        description: changeRolesData.description,
      };

      changeRolesData.authorityModules?.forEach(element => {

        const moduleName = element.authorities[0].name?.substring(
          element.authorities[0].name.indexOf('_') + 1,
          element.authorities[0].name.lastIndexOf('_')
        ).toLowerCase();

        modulesObject[`${moduleName}Select`] = createSelectedArray(changeRolesData, element.id);
      });

      return modulesObject;
    }
  };

  const onFinish = async (values: FinishEditType) => {
    const postBody = postBodyData(values);

    try {
      const { data } = isCreate
        ? await customAxios.post(isUserPage ? apiRoutes.USERS : apiRoutes.ROLES, postBody)
        : await customAxios.put(isUserPage ? apiRoutes.USERS : apiRoutes.ROLES, postBody);

      if (data) {
        isUserPage ? getUsers && getUsers() : getRoles && getRoles();
        isCreate ?
          message.success(
            isUserPage
              ? `Пользователь ${postBody?.login} создан`
              : `Роль ${postBody?.name} создана`,
          )
          :
          message.success(
            isUserPage
              ? `Пользователь ${changeUserData?.login} изменён`
              : `Роль ${changeRolesData?.name} изменена`,
          );
        onCancelClickHandler();
      }
    } catch (error: any) {
      message.error(resolveError(error.response));
    }
  };

  useEffect(() => {
    setFormInitValue(formInitialValues());
    forceUpdate({});
    setChangeData(changeRolesData);
  }, []);

  if (isUserPage) {
    return (
      <ModalUsersContent
        isCreate={isCreate}
        roles={roles}
        statuses={statuses}
        onCancelClickHandler={onCancelClickHandler}
        onFinish={onFinish}
        formInitialValues={formInitialValues()}
        setFormInitValue={setFormInitValue}
        onFinishFailed={onFinishFailed}
        removeHandler={removeHandler}
      />
    );
  } else {
    return (
      <ModalRolesContent
        isCreate={isCreate}
        onCancelClickHandler={onCancelClickHandler}
        onFinish={onFinish}
        formInitValue={formInitValue}
        setFormInitValue={setFormInitValue}
        onFinishFailed={onFinishFailed}
        removeHandler={removeHandler}
        rightsModules={rightsModules}
      />
    );
  }
};

export default ModalEdit;
