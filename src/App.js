import {  Button, Row, Col, Table } from 'antd';
import React, { useState } from 'react'
import './App.css';
import 'antd/dist/antd.css'
import pages from './defaultpages.json'
import FormParse from './components/form'
const rp = require('request-promise');
const $ = require('cheerio');


function urlify(text) {
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text)
}


const potusParse = (url, d) => {
  return rp(url)
    .then((html) => {
      return {
        name: $(d.nameSelector, html) != null ? $(d.nameSelector, html).text() : '',
        price: $(d.priceSelector, html) != null ? $(d.priceSelector, html).text().replace(/[^0-9.,]/g, " ") : '',
        url: url != null ? url : '',
        imagepath: ($(d.imageSelector, html)[0].hasOwnProperty('attribs') ? ($(d.imageSelector, html)[0].attribs.href != null ? $(d.imageSelector, html)[0].attribs.href : $(d.imageSelector, html)[0].attribs.src) : '')
          .trim()
          .substring(0, 2).search(/(\/\/|ht)/) !== -1 ? ($(d.imageSelector, html)[0].hasOwnProperty('attribs') ? ($(d.imageSelector, html)[0].attribs.href != null ? $(d.imageSelector, html)[0].attribs.href : $(d.imageSelector, html)[0].attribs.src) : '') : "http://" + new URL(url).host + ($(d.imageSelector, html)[0].hasOwnProperty('attribs') ? ($(d.imageSelector, html)[0].attribs.href != null ? $(d.imageSelector, html)[0].attribs.href : $(d.imageSelector, html)[0].attribs.src) : '')
      }
    })
    .catch(err => err)
    .catch(function (err) {
      console.error(err); // This will print any error that was thrown in the previous error handler.
    });
}

const loadData = async (url, hrefDetailSelector, detailSelector, protocol) => {
  return await rp(url, hrefDetailSelector, detailSelector, protocol)
    .then((html) => {
      const products = []
      const count = $(hrefDetailSelector, html).length
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          products.push($(hrefDetailSelector, html)[i].attribs.href)
        }
        let leftproducts = [...new Set(products)]
        return Promise.all(
          leftproducts.map((path) => {
            if (urlify(path)) {
              return potusParse(path, detailSelector)
            } else {
              return potusParse(protocol + new URL(url).host + path, detailSelector)
            }

          })
        )
      }
    })
    .catch((err) => {
      console.log(err)
    })
}



function App() {
  let URL
  let hrefSelector
  let protocol
  let detailSelector
  let nameSelector
  let priceSelector
  let imageSelector
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: 'ImageURL',
      dataIndex: 'imagepath',
      key: 'imagepath',
    },
  ];
  const [product, setProduct] = useState({})

  async function getData(values) {
    URL = values.URL
    hrefSelector = values.hrefSelector
    protocol = values.protocol
    nameSelector = values.nameSelector
    priceSelector = values.priceSelector
    imageSelector = values.imageSelector
    detailSelector = {
      nameSelector: nameSelector,
      priceSelector: priceSelector,
      imageSelector: imageSelector
    }
    let p = await loadData(URL, hrefSelector, detailSelector, protocol)
    try {
      if (p) {
        setProduct({ product: p })
      } else {
        setProduct({ product: [] })
      }
    } catch (err) {
      console.log(err)
      setProduct({ product: [] })
    }
  }

  const getDefaultPages = async () => {
    alert("Loading... (10-40s)")
    const defaultpages = JSON.parse(JSON.stringify(pages))
    const products = []
    defaultpages.map((page) => {
      page.urls.map(async (url) => {
        console.log(url)
        const detailSelector = {
          nameSelector: page.nameSelector,
          priceSelector: page.priceSelector,
          imageSelector: page.imageSelector
        }
        const p = await loadData(url, page.hrefDetailSelector, detailSelector, page.protocol)
        if (p && !p.includes('undefined')) {
          products.push(...p)
          setProduct({ product: products })
        }
      })
      return products
    })

  }


  return (
    <div>
      <Row justify={"center"}>
          <FormParse sendData={(values) => getData(values)} />
      </Row>
      <Row type={"flex"} justify={"center"}>
        <Col span={4}>
          <Button type="primary" onClick={getDefaultPages}>
            Get All Pages
            </Button>
        </Col>
        <Col span={18}>
          {product.product ?
            (<Table columns={columns} dataSource={product.product} rowKey={p => p.imagepath} />)
            : (<div><h1>No Data</h1></div>)}
        </Col>
      </Row>
    </div>
  );
}

export default App;
