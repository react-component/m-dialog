import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from './Dialog';
import IDialogPropTypes from './IDialogPropTypes';

function noop() {
}

export default class DialogWrap extends React.Component<IDialogPropTypes, any> {
  static defaultProps = {
    visible: false,
    prefixCls: 'rmc-dialog',
    onClose: noop,
  };

  componentDidMount() {
    if (this.props.visible) {
      this.componentDidUpdate();
    }
  }

  shouldComponentUpdate({ visible }) {
    return !!(this.props.visible || visible);
  }

  componentWillUnmount() {
    if (this.props.visible) {
      this.renderDialog(false);
    } else {
      this.removeContainer();
    }
  }

  componentDidUpdate() {
    this.renderDialog(this.props.visible);
  }

  getComponent(visible) {
    const props = {...this.props};
    ['visible', 'onAnimateLeave'].forEach(key => {
      if (props.hasOwnProperty(key)) {
        delete props[key];
      }
    });
    return <Dialog {...props} visible={visible} onAnimateLeave={this.removeContainer}  />;
  }

  removeContainer = () => {
    const container = document.querySelector(`#${this.props.prefixCls}-container`);
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      (container as any).parentNode.removeChild(container);
    }
  }

  renderDialog(visible) {
    const prefixCls = this.props.prefixCls;
    let container = document.querySelector(`#${prefixCls}-container`);
    if (!container) {
      container = document.createElement('div');
      container.setAttribute('id', `${prefixCls}-container`);
      document.body.appendChild(container);
    }
    ReactDOM.render(this.getComponent(visible), container);
  }

  render() {
    return (null as any);
  }
}
