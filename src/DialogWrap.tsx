import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from './Dialog';
import IDialogPropTypes from './IDialogPropTypes';

function noop() {
}

const IS_REACT_16 = !!(ReactDOM as any).createPortal;

export default class DialogWrap extends React.Component<IDialogPropTypes, any> {
  static defaultProps = {
    visible: false,
    prefixCls: 'rmc-dialog',
    onClose: noop,
  };

  _component: any;

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
      if (!IS_REACT_16) {
        this.renderDialog(false);
      } else {
        // TODO for react@16 createPortal animation
        this.removeContainer();
      }
    } else {
      this.removeContainer();
    }
  }

  componentDidUpdate() {
    if (!IS_REACT_16) {
      this.renderDialog(this.props.visible);
    }
  }

  saveRef = (node) => {
    if (IS_REACT_16) {
      this._component = node;
    }
  }

  getComponent = (visible) => {
    const props = {...this.props};
    ['visible', 'onAnimateLeave'].forEach(key => {
      if (props.hasOwnProperty(key)) {
        delete props[key];
      }
    });
    return (
      <Dialog {...props} visible={visible} onAnimateLeave={this.removeContainer} ref={this.saveRef} />
    );
  }

  removeContainer = () => {
    const container = document.querySelector(`#${this.props.prefixCls}-container`);
    if (container) {
      if (!IS_REACT_16) {
        ReactDOM.unmountComponentAtNode(container);
      }
      if ((container as any).children.length === 1) {
        (container as any).parentNode.removeChild(container);
      }
    }
  }

  getContainer = () => {
    const prefixCls = this.props.prefixCls;
    let container = document.querySelector(`#${prefixCls}-container`);
    if (!container) {
      container = document.createElement('div');
      container.setAttribute('id', `${prefixCls}-container`);
      document.body.appendChild(container);
    }
    return container;
  }

  renderDialog(visible) {
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this,
      this.getComponent(visible),
      this.getContainer(),
    );
  }

  render() {
    const { visible } = this.props;
    if (IS_REACT_16 && (visible || this._component)) {
      return (ReactDOM as any).createPortal(this.getComponent(visible), this.getContainer());
    }
    return (null as any);
  }
}
