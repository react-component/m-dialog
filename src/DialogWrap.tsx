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

  shouldComponentUpdate(nextProps) {
    return nextProps.visible !== this.props.visible;
  }

  componentDidUpdate() {
    this.renderDialog();
  }

  getComponent() {
    return <Dialog {...this.props} onAnimateLeave={this.removeContainer}  />;
  }

  removeContainer = () => {
    const container = document.querySelector(`#${this.props.prefixCls}-container`);
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      (container as any).parentNode.removeChild(container);
    }
  }

  renderDialog() {
    const prefixCls = this.props.prefixCls;
    let container = document.querySelector(`#${prefixCls}-container`);
    if (!container) {
      container = document.createElement('div');
      container.setAttribute('id', `${prefixCls}-container`);
      document.body.appendChild(container);
    }
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      this.getComponent(),
      container,
    );
  }

  render() {
    return (null as any);
  }
}
