import { FC, useEffect, useState } from 'react';

// ui
import 'antd/dist/antd.css';
import { Form, Input, Button, Modal, Select, Popconfirm } from 'antd';

// types
import { ModalContentRolesProps } from '../types';
import { FormInitialValues } from '../types';

// styles
import '../ModalEdit.scss';

const ModalRolesContent: FC<ModalContentRolesProps> = ({
  isCreate,
  onCancelClickHandler,
  onFinish,
  formInitValue,
  setFormInitValue,
  onFinishFailed,
  removeHandler,
  rightsModules,
}) => {
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState<FormInitialValues | undefined>();
  const [isFormChange, setIsFormChange] = useState<boolean>(false);
  const [, forceUpdate] = useState({});
  const { Option } = Select;

  const onChangeHandler = (event: any, fieldName: string) => {
    setIsFormChange(true);

    setFormValues({
      ...formValues,
      [fieldName]: event.target.value,
    });
  };

  const changeModuleHandler = (newValue: any, moduleName: string) => {
    setIsFormChange(true);

    setFormValues({
      ...formValues,
      [`${moduleName}Select`]: newValue?.filter((element: string) => !element.includes('NONE')),
    });
  };

  useEffect(() => {
    form.setFieldsValue(formValues);
    setFormInitValue(formValues);
  }, [formValues]);

  useEffect(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    setFormValues(formInitValue);
  }, [formInitValue]);

  return (
    <Modal
      title={isCreate ? 'Создать роль' : 'Изменить роль'}
      visible={true}
      onCancel={onCancelClickHandler}
      footer={null}
      width={'40%'}>
      <Form
        form={form}
        name="userChange"
        labelCol={{
          span: 4,
        }}
        initialValues={formValues}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        className="roles-form">
        <Form.Item
          label="Название роли"
          name="name"
          rules={[
            {
              required: true,
              message: 'Введите название роли',
            },
          ]}>
          <Input onChange={(event) => onChangeHandler(event, 'name')} />
        </Form.Item>

        <Form.Item
          label="Описание"
          name="description"
          rules={[
            {
              required: false,
              message: 'Описание',
            },
          ]}>
          <Input.TextArea onChange={(event) => onChangeHandler(event, 'description')} />
        </Form.Item>

        <Form.Item label="Права">
          <Input.Group className="rights">
            {rightsModules?.map((rightModule: any, key) => {
              const moduleName = rightModule.authorities[0].name
                .substring(
                  rightModule.authorities[0].name.indexOf('_') + 1,
                  rightModule.authorities[0].name.lastIndexOf('_'),
                )
                .toLowerCase();

              return (
                <Form.Item
                  label={rightModule.name}
                  key={rightModule.id + key}
                  name={`${moduleName}Select`}
                  rules={[
                    {
                      required: false,
                    },
                  ]}>
                  <Select
                    placeholder={rightModule.name}
                    optionFilterProp="children"
                    mode="multiple"
                    onChange={(newValue) => changeModuleHandler(newValue, moduleName)}
                    filterOption={(input, option: any) =>
                      option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }>
                    {rightModule.authorities?.map((model: any) => {
                      return (
                        <Option key={model.id} value={model.name}>
                          {model.title}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              );
            })}
          </Input.Group>
        </Form.Item>

        {!isCreate && (
          <Form.Item>
            <Popconfirm
              title="Удалить роль?"
              onConfirm={removeHandler}
              okText="Да"
              cancelText="Нет">
              <Button type="primary">Удалить учётную запись</Button>
            </Popconfirm>
          </Form.Item>
        )}

        <div className="modal-footer">
          <Form.Item shouldUpdate>
            {() => (
              <Button type="primary" htmlType="submit" disabled={!isFormChange}>
                Сохранить
              </Button>
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="button" onClick={onCancelClickHandler}>
              Отменить
            </Button>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalRolesContent;
