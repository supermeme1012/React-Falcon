import React from 'react';
import Axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getErrorAlert } from 'helpers/utils';
import Loading from 'components/loading';
import handleError from 'utils/handleError';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { setPointMenuData } from 'redux/slices/currentDataSlice';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Modal, message, Typography } from 'antd';
import AdvanceTableWrapper from 'components/common/advance-table/AdvanceTableWrapper';
import AdvanceTable from 'components/common/advance-table/AdvanceTable';
import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
import ActionButton from 'components/common/ActionButton';
import endpoint from '../../utils/endpoint';
const { confirm } = Modal;
const { Title } = Typography;
function SettingsList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const _isMounted = useRef(false);
  // let { routeKey } = useParams();
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [layoutData, setLayoutData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [memberLists, setMemeberLists] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [resultsPerPage, SetresultsPerPage] = useState(999);
  const [branches, setBranches] = useState([]);
  let _array = [];
  const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef();
      const resolvedRef = ref || defaultRef;
      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
      }, [resolvedRef, indeterminate]);

      return (
        <Form.Check
          type="checkbox"
          className="form-check fs-0 mb-0 d-flex align-items-center"
        >
          <Form.Check.Input type="checkbox" ref={resolvedRef} {...rest} />
        </Form.Check>
      );
    }
  );
  const initPageModule = async () => {
    try {
      // default part
      _isMounted.current && setLoadingSchema(true);
      const ep = endpoint.getPointDataManagerSchemaEndpoint('list');
      const moduleSchemaRes = await Axios.get(ep);
      let schema = moduleSchemaRes.data;
      console.log('menuSchema:->', schema);
      let layoutSchema = schema.layout;
      dispatch(setPointMenuData({ currentPointMenuSchema: schema.menu })); // store current member menu
      setMemeberLists(layoutSchema.data);
      const branchesList = await Axios.get(
        endpoint.getModuleDataEndpoint('bb_loyal2_branches')
      );
      setBranches(branchesList.data.list);
      const membersList = await Axios.get(
        endpoint.getDataManagerSchemaEndpoint('list')
      );
      setMemberList(membersList.data.layout.data);
      _isMounted.current && setLayoutData(layoutSchema);
      // console.log(memberRes.data,"memberRes.daata")
    } catch (error) {
      handleError(error, true);
    } finally {
      _isMounted.current && setLoadingSchema(false);
    }
  };
  useEffect(() => {
    _isMounted.current = true;
    initPageModule();
    return () => {
      _isMounted.current = false;
    };
  }, []);

  const editRow = row => {
    navigate('/datamanager/bb_loyal2_points/edit/' + row._id);
  };
  const deleteRow = () => {
    _array.length > 0
      ? showDeleteConfirm(_array)
      : message.error('Please select item!');
    console.log(_array, 'delete=> selected item');
  };
  let index = 0;
  const AllChange = memberData => {
    // console.log(row);
    index++;
    _array = [];
    console.log(index % 2);
    index % 2 == '1'
      ? memberData.data.map(id => {
          console.log(id._id);
          _array.push(id._id);
        })
      : (_array = []);
  };

  const onChange = row => {
    let index;
    index = _array.indexOf(row.original._id);
    index > -1 ? _array.splice(index, 1) : _array.push(row.original._id);
    _array.sort();
  };

  const row_select = row => {
    navigate('/datamanager/bb_loyal2_points/view/' + row._id);
  };
  const showDeleteConfirm = item => {
    confirm({
      title: 'Delete selected items?',
      icon: <ExclamationCircleFilled />,
      content: '',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onCancel() {
        console.log(item, 'deleted item');
      },
      onOk() {
        // console.log(item.length);
        onDelete(item);
      }
    });
  };
  const onDelete = async item => {
    let i = item.length;
    setLoadingSchema(true);
    await item.map(async id => {
      await Axios.delete(endpoint.appUsers(`/module/bb_loyal2_points/${id}`));
      i--;
      console.log('counter', i);
      if (i == 0) {
        initPageModule();
        message.success('Deleted successful!');
        _array = [];
      }
    });
  };
  useEffect(() => {
    console.log(layoutData, 'this is layoutdata------');
    if (layoutData) {
      let objectData = layoutData.options.columns;
      SetresultsPerPage(
        layoutData.options.pagination.results_per_page
          ? layoutData.options.pagination.results_per_page
          : 999
      );
      let tempArray = [
        {
          accessor: 'row',
          Header: 'Row',
          Cell: rowData => {
            return <>{rowData.row.index + 1}</>;
          }
        }
      ];
      for (const key in objectData) {
        if (objectData[key] != 'Owner') {
          let tempElement = {};
          tempElement.accessor = key;
          tempElement.Header = objectData[key];
          tempElement.Cell = function (rowData) {
            let value = rowData.row.original[key];
            if (key === 'branchISbb_loyal2_branchesID') {
              let index = branches.findIndex(val => {
                return value == val._id;
              });
              if (index === -1) value = '';
              else value = branches[index].name;
            }
            if (key === 'memberISbb_usersID') {
              const index = memberList.findIndex(val => {
                return value == val._id;
              });
              if (index === -1) value = '';
              else
                value =
                  memberList[index].last_name +
                  ', ' +
                  memberList[index].first_name +
                  ' ' +
                  (memberList[index].company_name === null
                    ? ''
                    : memberList[index].company_name);
            }
            const divTag = (
              <div
                onClick={() => {
                  row_select(rowData.row.original);
                }}
                style={{ cursor: 'pointer' }}
              >
                {value}
              </div>
            );
            return divTag;
          };
          tempArray.push(tempElement);
        }
      }
      let editBtn = {
        id: 'Edit',
        Header: (
          <>
            <ActionButton
              icon="trash-alt"
              onClick={() => deleteRow()}
              title="Delete"
              variant="action"
              className="p-0 me-2"
            />
          </>
        ),

        Cell: rowData => {
          return (
            <>
              <ActionButton
                icon="edit"
                title="Edit"
                onClick={() => editRow(rowData.row.original)}
                variant="action"
                className="p-0 me-2"
              />
            </>
          );
        }
      };
      tempArray.push(editBtn);

      let checkBtn = {
        id: 'selection',
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <IndeterminateCheckbox
            {...getToggleAllRowsSelectedProps()}
            onClick={() => AllChange(layoutData)}
          />
        ),
        Cell: ({ row }) => (
          <div>
            <IndeterminateCheckbox
              {...row.getToggleRowSelectedProps()}
              onClick={() => onChange(row)}
            />
          </div>
        )
      };
      tempArray.push(checkBtn);
      setColumns(tempArray);
    }
  }, [layoutData]);

  // Loading part
  if (loadingSchema) {
    return <Loading style={{ marginTop: 150 }} msg="Loading Schema..." />;
  }
  if (!layoutData) return getErrorAlert({ onRetry: initPageModule });
  // end Loading part
  return (
    <>
      <Title className="mx-4" level={4}>
        All points record
      </Title>
      <AdvanceTableWrapper
        columns={columns}
        data={memberLists}
        sortable
        // pagination
        // selection
        perPage={resultsPerPage}
      >
        <AdvanceTable
          table
          headerClassName="bg-200 text-900 text-nowrap align-middle"
          rowClassName="align-middle white-space-nowrap"
          tableProps={{
            bordered: true,
            striped: true,
            className: 'fs--1 mb-0 overflow-hidden'
          }}
        />
        <div className="mt-3">
          <AdvanceTableFooter
            rowCount={memberLists.length}
            table
            rowInfo
            navButtons
            // rowsPerPageSelection
          />
        </div>
      </AdvanceTableWrapper>
    </>
  );
}
export default SettingsList;
