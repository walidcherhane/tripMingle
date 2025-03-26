import React, { ComponentType, PropsWithChildren } from "react";
import {
  TouchableWithoutFeedback,
  Keyboard,
  View,
  ViewProps,
} from "react-native";

const DismissKeyboardHOC = <P extends object>(Comp: ComponentType<P>) => {
  return (props: PropsWithChildren<P>) => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Comp {...props}>{props.children}</Comp>
    </TouchableWithoutFeedback>
  );
};

const DismissKeyboardView = DismissKeyboardHOC<ViewProps>(View);

export default DismissKeyboardView;
