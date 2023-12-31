import React from 'react';
import Axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Typography, DatePicker, Input, Row, Col } from 'antd';
import { Button } from 'react-bootstrap';
// import { useParams } from 'react-router-dom';
import endpoint from '../../utils/endpoint';
import { getErrorAlert } from 'helpers/utils';
import Loading from 'components/loading';
import handleError from 'utils/handleError';
import { setMemberMenuData } from 'redux/slices/currentDataSlice';
const { Title, Text } = Typography;
const inputStyle = {
  borderRadius: '10px',
  width: '100%'
};

function SearchGroups() {
  const dispatch = useDispatch();
  const _isMounted = useRef(false);
  // let { routeKey } = useParams();
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [layoutData, setLayoutData] = useState(null);
  const initPageModule = async () => {
    try {
      // default part
      _isMounted.current && setLoadingSchema(true);
      const ep = endpoint.getDataManagerGroupSchemaEndpoint('search');
      const moduleSchemaRes = await Axios.get(ep);
      let schema = moduleSchemaRes.data;
      console.log('menuSchema:->', schema);
      let layoutSchema = schema.layout;
      console.log(schema.menu, ' schema.menu schema.menu schema.menu');
      dispatch(setMemberMenuData({ currentMemberMenuSchema: schema.menu })); // store current member menu
      _isMounted.current && setLayoutData(layoutSchema);
      // end default part
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

  if (loadingSchema) {
    return <Loading style={{ marginTop: 150 }} msg="Loading Schema..." />;
  }
  if (!layoutData) return getErrorAlert({ onRetry: initPageModule });

  return (
    <>
      <Row className="mx-4 mt-3">
        <Col span={24}>
          <Title level={4} className="mb-3">
            Search groups/tiers
          </Title>
        </Col>
      </Row>
      <Row className="mx-4 mt-3">
        <Col xs={24} md={24} lg={23}>
          {/* <Text style={{color:'#444444'}} strong className="mb-2">Free text search</Text> */}
          <Input placeholder="Free text search" style={inputStyle} />
        </Col>
      </Row>
      <Row className="mx-4 mt-7" align="middle">
        <Col xs={24} md={24} lg={14} xl={9}>
          <Text className="text-label" strong>
            Date Added/Imported between
          </Text>
        </Col>
        <Col xs={10} md={7} lg={3} xl={4}>
          <DatePicker placeholder="from" style={inputStyle} />
        </Col>
        <Col xs={4} md={4} lg={2} xl={2} style={{ textAlign: 'center' }}>
          <Text strong className="text-label">
            and
          </Text>
        </Col>
        <Col xs={10} md={7} lg={3} xl={4}>
          <DatePicker placeholder="to" style={inputStyle} />
        </Col>
        <Col xs={24} md={6} lg={4} xl={4}>
          <Row>
            <Col span={24}>
              <Button
                variant="outline-primary"
                style={{ float: 'right' }}
                className="rounded-pill px-4 py-2"
              >
                Search
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}
export default SearchGroups;
