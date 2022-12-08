import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Area, Rose, Column } from '@ant-design/plots';
import { each, groupBy } from '@antv/util';

const DemoArea = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch('https://gw.alipayobjects.com/os/bmw-prod/b21e7336-0b3e-486c-9070-612ede49284e.json')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  const config = {
    data,
    xField: 'date',
    yField: 'value',
    seriesField: 'country',
    slider: {
      start: 0.1,
      end: 0.9,
    },
  };

  return <Area {...config} />;
};

const DemoRose = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch('https://gw.alipayobjects.com/os/antfincdn/XcLAPaQeeP/rose-data.json')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  // 分组玫瑰图
  const config = {
    data,
    xField: 'type',
    yField: 'value',
    isGroup: true,
    // 当 isGroup 为 true 时，该值为必填
    seriesField: 'user',
    radius: 0.9,
    label: {
      offset: -15,
    },
    pattern: {
      type: 'dot',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return <Rose {...config} />;
};

const DemoColumn = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch('https://gw.alipayobjects.com/os/antfincdn/8elHX%26irfq/stack-column-data.json')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  // 也可以在项目中直接使用 lodash
  const annotations = [];
  each(groupBy(data, 'year'), (values, k) => {
    const value = values.reduce((a, b) => a + b.value, 0);
    annotations.push({
      type: 'text',
      position: [k, value],
      content: `${value}`,
      style: {
        textAlign: 'center',
        fontSize: 14,
        fill: 'rgba(0,0,0,0.85)',
      },
      offsetY: -10,
    });
  });
  const config = {
    data,
    isStack: true,
    xField: 'year',
    yField: 'value',
    seriesField: 'type',
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'bottom', 'middle'
      // 可配置附加的布局方法
      layout: [
        // 柱形图数据标签位置自动调整
        {
          type: 'interval-adjust-position',
        }, // 数据标签防遮挡
        {
          type: 'interval-hide-overlap',
        }, // 数据标签文颜色自动调整
        {
          type: 'adjust-color',
        },
      ],
    },
    // 使用 annotation （图形标注）来展示：总数的 label
    annotations,
  };

  return <Column {...config} />;
};

export default class App extends React.Component {
  download = async () => {
    var element = document.getElementById("demo");    // 这个dom元素是要导出pdf的div容器
    var w = element.offsetWidth;    // 获得该容器的宽
    var h = element.offsetWidth;    // 获得该容器的高
    var offsetTop = element.offsetTop;    // 获得该容器到文档顶部的距离
    var offsetLeft = element.offsetLeft;    // 获得该容器到文档最左的距离
    var canvas = document.createElement("canvas");
    var abs = 0;
    var win_i = document.body.clientWidth;    // 获得当前可视窗口的宽度（不包含滚动条）
    var win_o = window.innerWidth;    // 获得当前窗口的宽度（包含滚动条）
    if (win_o > win_i) {
      abs = (win_o - win_i) / 2;    // 获得滚动条长度的一半
    }
    canvas.width = w * 2;    // 将画布宽&&高放大两倍
    canvas.height = h * 2;
    var context = canvas.getContext("2d");
    context.scale(2, 2);
    context.translate(-offsetLeft - abs, -offsetTop);
    // 这里默认横向没有滚动条的情况，因为offset.left(),有无滚动条的时候存在差值，因此
    // translate的时候，要把这个差值去掉
    html2canvas(element, {
      allowTaint: true,
      scale: 2 // 提升画面质量，但是会增加文件大小
    }).then(function (canvas) {
      var contentWidth = canvas.width;
      var contentHeight = canvas.height;
      //一页pdf显示html页面生成的canvas高度;
      var pageHeight = contentWidth / 592.28 * 841.89;
      //未生成pdf的html页面高度
      var leftHeight = contentHeight;
      //页面偏移
      var position = 0;
      //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
      var imgWidth = 595.28;
      var imgHeight = 592.28 / contentWidth * contentHeight;

      var pageData = canvas.toDataURL('image/jpeg', 1.0);

      var pdf = new jsPDF('', 'pt', 'a4');

      //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
      //当内容未超过pdf一页显示的范围，无需分页
      if (leftHeight < pageHeight) {
        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {    // 分页
        while (leftHeight > 0) {
          pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
          leftHeight -= pageHeight;
          position -= 841.89;
          //避免添加空白页
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }
      pdf.save('导出.pdf');
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.download}>
          生成报告
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginTop: 15 }}>
            <div>
              尊敬的用户：
            </div>
            <div>
              依托本系统管理节能，本月共计发生计划外事件0起，有效介入管控事件0起，累计管控收益0元。
            </div>
          </div>
          <div id="demo" style={{ padding: 24 }}>
            <DemoArea />
            <DemoRose />
            <DemoColumn />
          </div>
        </div>
      </div>
    )
  }
}