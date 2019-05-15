/* eslint-disable func-names */
import expect from 'expect.js';
import Dialog from '../index';
// import '../assets/bootstrap.less';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
const Simulate = TestUtils.Simulate;
import async from 'async';

describe('dialog', () => {
  const title = '第一个title';
  let dialog;

  const container = document.createElement('div');
  container.id = 't1';
  document.body.appendChild(container);

  let callback1;

  class DialogWrap extends React.Component {
    state = {
      visible: false,
      maskClosable: true,
    };
    render() {
      return (
        <Dialog
          {...this.props}
          visible={this.state.visible}
          maskClosable={this.state.maskClosable}
        />
      );
    }
  }

  beforeEach(() => {
    function onClose() {
      callback1 = 1;
      dialog.setState({
        visible: false,
      });
    }

    callback1 = 0;
    dialog = ReactDOM.render((
      <DialogWrap
        style={{ width: 600 }}
        title={title}
        onClose={onClose}
      >
        <p>第一个dialog</p>
      </DialogWrap>), container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('show', (done) => {
    dialog.setState({
      visible: true,
    });
    setTimeout(() => {
      expect($('.rmc-dialog-wrap').css('display'))
        .to.be('block');
      done();
    }, 10);
  });

  it('close', (done) => {
    dialog.setState({
      visible: true,
    });
    dialog.setState({
      visible: false,
    });
    setTimeout(() => {
      expect($('.rmc-dialog-wrap').length).to.be(0);
      done();
    }, 10);
  });

  it('mask', () => {
    dialog.setState({
      visible: true,
    });
    expect($('.rmc-dialog-mask').length).to.be(1);
  });

  it('click close', (finish) => {
    async.series([(done) => {
      dialog.setState({
        visible: true,
      });
      setTimeout(done, 10);
    }, (done) => {
      const btn = $('.rmc-dialog-close')[0];
      Simulate.click(btn);
      setTimeout(done, 10);
    }, (done) => {
      expect(callback1).to.be(1);
      expect($('.rmc-dialog-wrap').length).to.be(0);
      done();
    }], finish);
  });

  it('mask to close', (finish) => {
    async.series([(done) => {
      dialog.setState({
        visible: true,
      });
      setTimeout(done, 500);
    }, (done) => {
      const mask = $('.rmc-dialog-wrap')[0];
      Simulate.click(mask);
      setTimeout(done, 10);
    }, (done) => {
      // dialog should closed after mask click
      expect(callback1).to.be(1);
      expect($('.rmc-dialog-wrap').length).to.be(0);
      done();
    }, (done) => {
      dialog.setState({
        visible: true,
        maskClosable: false,
      });

      setTimeout(done, 10);
    }, (done) => {
      // dialog should stay on visible after mask click if set maskClosable to false
      // expect(callback1).to.be(0);
      expect($('.rmc-dialog-wrap').css('display'))
        .to.be('block');
      done();
    }], finish);
  });

  it('render footer padding correctly', () => {
    async.series([() => {
      ReactDOM.render(<DialogWrap footer={''} />, container)
    }, () => {
      expect($('.rmc-dialog-footer').css('padding')).to.be('10px 20px');
    }]);
  });
});
