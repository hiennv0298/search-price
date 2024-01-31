import { Form, Input, Button } from 'antd';
import React, { useState, useEffect } from 'react'


function simulateNetworkRequest() {
    return new Promise(resolve => setTimeout(resolve, 5000));
}

function FormParse(props) {
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (isLoading) {
            simulateNetworkRequest().then(() => {
                setLoading(false);
            });
        }
    }, [isLoading]);

    const handleClick = () => setLoading(true);

    function handleSubmit(e) {
        e.preventDefault()
        !isLoading && handleClick()
        props.form.validateFields((err, values) => {
            if (!err) {
                // const { URL, hrefSelector, keyFilterHref, protocol, nameSelector, priceSelector, imageSelector } = values
                props.sendData(values)
            }
        })
    }


    const { getFieldDecorator } = props.form;

    return (
        <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} onSubmit={(e) => handleSubmit(e)}>
            <Form.Item label="URL">
                {getFieldDecorator('URL', {
                    initialValue: 'https://daohaisan.vn/collections/ngao-so-oc',
                    rules: [{ required: true, message: 'Please input' }],
                })(<Input />)}
            </Form.Item>
            <Form.Item label="hrefSelector">
                {getFieldDecorator('hrefSelector', {
                    initialValue: 'div > div > a',
                    rules: [{ required: true, message: 'Please input' }],
                })(<Input />)}
            </Form.Item>
            <Form.Item label="protocol">
                {getFieldDecorator('protocol', {
                    initialValue: 'https://',
                    rules: [{ required: true, message: 'Please input' }],
                })(<Input />)}
            </Form.Item>
            <Form.Item label="nameSelector">
                {getFieldDecorator('nameSelector', {
                    initialValue: 'div > h1',
                    rules: [{ required: true, message: 'Please input' }],
                })(<Input />)}
            </Form.Item>
            <Form.Item label="priceSelector">
                {getFieldDecorator('priceSelector', {
                    initialValue: '.product_price',
                    rules: [{ required: true, message: 'Please input' }],
                })(<Input />)}
            </Form.Item>
            <Form.Item label="imageSelector">
                {getFieldDecorator('imageSelector', {
                    initialValue: '#zoomparent > img',
                    rules: [{ required: true, message: 'Please input' }],
                })(<Input />)}
            </Form.Item>
            <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
                <Button type="primary" htmlType="submit" disabled={isLoading}>
                    {isLoading ? 'Loading…' : 'Click to load'}
                </Button>
            </Form.Item>
        </Form>
    );
}

// const WrappedForm = Form.create({ name: 'coordinated' })(FormParse);
export default Form.create()(FormParse)