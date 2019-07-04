import React from 'react';
import Animate from 'rc-animate';
import LazyRenderBox from './LazyRenderBox';
import IDialogPropTypes from './IDialogPropTypes';

function noop() {
}

// 缓存body原有的样式属性
let originPosition;
let originWidth;
let originTop;
// body是否已设置成fixed组织滚动
let fixed = false;
// dialog实例计数
let count = 0;

function fixedBody() {
  if (!fixed) { // 避免重复设置造成Body原属性获取失败
    const { position, width, top } = document.body.style;
    originPosition = position;
    originWidth = width;
    originTop = top;
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollTop}px`;
    fixed = true;
  }
}

function looseBody() {
  if (!count) { // 如果当前页面还存在Dialog实例，则不能重置
    const body = document.body;
    body.style.position = originPosition;
    body.style.width = originWidth;
    window.scrollTo(0, -parseInt(body.style.top || '0', 10));
    body.style.top = originTop;
    fixed = false;
  }
}

export default class Dialog extends React.Component<IDialogPropTypes, any> {
  static defaultProps = {
    afterClose: noop,
    className: '',
    mask: true,
    visible: false,
    closable: true,
    maskClosable: true,
    prefixCls: 'rmc-dialog',
    onClose: noop,
  };

  dialogRef: any;
  bodyRef: any;
  headerRef: any;
  footerRef: any;
  wrapRef: any;

  constructor(props) {
    super(props);
    count++;
  }

  componentWillUnmount() {
    count--;
    looseBody();
    // fix: react@16 no dismissing animation
    document.body.style.overflow = '';
    if (this.wrapRef) {
      this.wrapRef.style.display = 'none';
    }
  }

  getZIndexStyle() {
    const style: any = {};
    const props = this.props;
    if (props.zIndex !== undefined) {
      style.zIndex = props.zIndex;
    }
    return style;
  }

  getWrapStyle() {
    const wrapStyle = this.props.wrapStyle || {};
    return {...this.getZIndexStyle(), ...wrapStyle};
  }

  getMaskStyle() {
    const maskStyle = this.props.maskStyle || {};
    return {...this.getZIndexStyle(), ...maskStyle};
  }

  getMaskTransitionName() {
    const props = this.props;
    let transitionName = props.maskTransitionName;
    const animation = props.maskAnimation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  }

  getTransitionName() {
    const props = this.props;
    let transitionName = props.transitionName;
    const animation = props.animation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  }

  getMaskElement() {
    const props = this.props;
    let maskElement;
    if (props.mask) {
      const maskTransition = this.getMaskTransitionName();
      maskElement = (
        <LazyRenderBox
          style={this.getMaskStyle()}
          key="mask-element"
          className={`${props.prefixCls}-mask`}
          hiddenClassName={`${props.prefixCls}-mask-hidden`}
          visible={props.visible}
          {...props.maskProps}
        />
      );
      if (maskTransition) {
        maskElement = (
          <Animate
            key="mask"
            showProp="visible"
            transitionAppear
            component=""
            transitionName={maskTransition}
          >
            {maskElement}
          </Animate>
        );
      }
    }
    return maskElement;
  }

  getDialogElement = () => {
    const props = this.props;
    const closable = props.closable;
    const prefixCls = props.prefixCls;

    let footer;
    if (props.footer) {
      footer = (
        <div className={`${prefixCls}-footer`} ref={el => this.footerRef = el}>
          {props.footer}
        </div>
      );
    }

    let header;
    if (props.title) {
      header = (
        <div className={`${prefixCls}-header`} ref={el => this.headerRef = el}>
          <div className={`${prefixCls}-title`}>
            {props.title}
          </div>
        </div>
      );
    }

    let closer;
    if (closable) {
      closer = (
        <button
          onClick={this.close}
          aria-label="Close"
          className={`${prefixCls}-close`}
        >
          <span className={`${prefixCls}-close-x`} />
        </button>);
    }

    const transitionName = this.getTransitionName();
    const dialogElement = (
      <LazyRenderBox
        key="dialog-element"
        role="document"
        ref={el => this.dialogRef = el}
        style={props.style || {}}
        className={`${prefixCls} ${props.className || ''}`}
        visible={props.visible}
      >
        <div className={`${prefixCls}-content`}>
          {closer}
          {header}
          <div
            className={`${prefixCls}-body`}
            style={props.bodyStyle}
            ref={el => this.bodyRef = el}
          >
            {props.children}
          </div>
          {footer}
        </div>
      </LazyRenderBox>
    );
    return (
      <Animate
        key="dialog"
        showProp="visible"
        onAppear={this.onAnimateAppear}
        onLeave={this.onAnimateLeave}
        transitionName={transitionName}
        component=""
        transitionAppear
      >
        {dialogElement}
      </Animate>
    );
  }

  onAnimateAppear = () => {
    document.body.style.overflow = 'hidden';
  }

  onAnimateLeave = () => {
    document.body.style.overflow = '';
    if (this.wrapRef) {
      this.wrapRef.style.display = 'none';
    }
    if (this.props.onAnimateLeave) {
      this.props.onAnimateLeave();
    }
    if (this.props.afterClose) {
      this.props.afterClose();
    }
  }

  close = (e) => {
    if (this.props.onClose) {
      this.props.onClose(e);
    }
  }

  onMaskClick = (e) => {
    if (e.target === e.currentTarget) {
      this.close(e);
    }
  }

  render() {
    const { props } = this;
    const { prefixCls, maskClosable } = props;
    const style = this.getWrapStyle();
    if (props.visible) {
      fixedBody();
      style.display = null;
    }
    return (
      <div>
        {this.getMaskElement()}
        <div
          className={`${prefixCls}-wrap ${props.wrapClassName || ''}`}
          ref={el => this.wrapRef = el}
          onClick={maskClosable ? this.onMaskClick : undefined}
          role="dialog"
          aria-labelledby={props.title}
          style={style}
          {...props.wrapProps}
        >
          {this.getDialogElement()}
        </div>
      </div>
    );
  }
}
