import * as React from 'react';
import {
  View, Modal, Animated,
  TouchableWithoutFeedback,
  StyleSheet, Dimensions,
  Easing, ViewStyle,
} from 'react-native';

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
  } as ViewStyle,
  mask: {
    backgroundColor: 'black',
    opacity: .5,
  } as ViewStyle,
  content: {
    backgroundColor: 'white',
  } as ViewStyle,
  absolute: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

const screen = Dimensions.get('window');

export interface IModalPropTypes {
  wrapStyle?: ViewStyle;
  maskStyle?: ViewStyle;
  style?: {};
  animationType: 'none' | 'fade' | 'slide-up' | 'slide-down';
  animationDuration?: number;
  visible: boolean;
  maskClosable?: boolean;
  animateAppear?: boolean;
  onClose?: () => void;
  onAnimationEnd?: (visible: boolean) => void;
}

export default class RCModal extends React.Component<IModalPropTypes, any> {
  static defaultProps = {
    wrapStyle: styles.wrap,
    maskStyle: styles.mask,
    animationType: 'slide-up',
    animateAppear: false,
    animationDuration: 300,
    visible: false,
    maskClosable: true,
    onClose() {
    },
    onAnimationEnd(_visible: boolean) {

    },
  } as IModalPropTypes;

  animMask: any;
  animDialog: any;

  constructor(props) {
    super(props);
    const { visible } = props;
    this.state = {
      position: new Animated.Value(this.getPosition(visible)),
      scale: new Animated.Value(this.getScale(visible)),
      opacity: new Animated.Value(this.getOpacity(visible)),
      modalVisible: visible,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (this.shouldComponentUpdate(nextProps, null)) {
      this.setState({
        modalVisible: true,
      });
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.visible || this.props.visible !== nextProps.visible) {
      return true;
    }
    if (nextState) {
      if (nextState.modalVisible !== this.state.modalVisible) {
        return true;
      }
    }
    return false;
  }
  componentDidMount() {
    if (this.props.animateAppear && this.props.animationType !== 'none') {
      this.componentDidUpdate({});
    }
  }
  componentDidUpdate(prevProps) {
    const { props } = this;
    if (prevProps.visible !== props.visible) {
      this.animateDialog(props.visible);
    }
  }
  animateMask = (visible) => {
    this.stopMaskAnim();
    this.state.opacity.setValue(this.getOpacity(!visible));
    this.animMask = Animated.timing(
      this.state.opacity,
      {
        toValue: this.getOpacity(visible),
        duration: this.props.animationDuration,
      },
    );
    this.animMask.start(() => {
      this.animMask = null;
    });
  }
  stopMaskAnim = () => {
    if (this.animMask) {
      this.animMask.stop();
      this.animMask = null;
    }
  }
  stopDialogAnim = () => {
    if (this.animDialog) {
      this.animDialog.stop();
      this.animDialog = null;
    }
  }
  animateDialog = (visible) => {
    this.stopDialogAnim();
    this.animateMask(visible);

    let { animationType, animationDuration } = this.props;
    animationDuration = animationDuration!;
    if (animationType !== 'none') {
      if (animationType === 'slide-up' || animationType === 'slide-down') {
        this.state.position.setValue(this.getPosition(!visible));
        this.animDialog = Animated.timing(
          this.state.position,
          {
            toValue: this.getPosition(visible),
            duration: animationDuration,
            easing: (visible ? Easing.elastic(0.8) : undefined) as any,
          },
        );
      } else if (animationType === 'fade') {
        this.animDialog = Animated.parallel([
          Animated.timing(
            this.state.opacity,
            {
              toValue: this.getOpacity(visible),
              duration: animationDuration,
              easing: (visible ? Easing.elastic(0.8) : undefined) as any,
            },
          ),
          Animated.spring(
            this.state.scale,
            {
              toValue: this.getScale(visible),
            },
          ),
        ]);
      }

      this.animDialog.start(() => {
        this.animDialog = null;
        if (!visible) {
          this.setState({
            modalVisible: false,
          });
        }
        if (this.props.onAnimationEnd) {
          this.props.onAnimationEnd(visible);
        }
      });
    } else {
      if (!visible) {
        this.setState({
          modalVisible: false,
        });
      }
    }
  }
  close = () => {
    this.animateDialog(false);
  }
  onMaskClose = () => {
    if (this.props.maskClosable && this.props.onClose) {
      this.props.onClose();
    }
  }
  getPosition = (visible) => {
    if (visible) {
      return 0;
    }
    return this.props.animationType === 'slide-down' ? -screen.height : screen.height;
  }
  getScale = (visible) => {
    return visible ? 1 : 1.05;
  }
  getOpacity = (visible) => {
    return visible ? 1 : 0;
  }
  render() {
    const { props } = this;
    if (!this.state.modalVisible) {
      return null as any;
    }
    const animationStyleMap = {
      none: {},
      'slide-up': { transform: [{ translateY: this.state.position }] },
      'slide-down': { transform: [{ translateY: this.state.position }] },
      fade: { transform: [{ scale: this.state.scale }], opacity: this.state.opacity },
    };

    return (
      <Modal
        visible
        transparent
        onRequestClose={this.props.onClose}
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={[styles.wrap, props.wrapStyle]}>
          <TouchableWithoutFeedback
            onPress={ this.onMaskClose }
          >
            <Animated.View
              style={[styles.absolute, { opacity: this.state.opacity }]}
            >
              <View style={[styles.absolute, props.maskStyle]} />
            </Animated.View>
          </TouchableWithoutFeedback>
          <Animated.View
            style={[styles.content, props.style, animationStyleMap[props.animationType]]}
          >
            {this.props.children}
          </Animated.View>
        </View>
      </Modal>
    );
  }
}
