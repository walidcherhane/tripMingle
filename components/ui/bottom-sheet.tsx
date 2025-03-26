import React, { forwardRef } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { spacing } from "@/theme/spacing";
import BottomSheetComponent, {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetProps,
} from "@gorhom/bottom-sheet";

const { height } = Dimensions.get("window");

interface _BottomSheetProps extends BottomSheetProps {
  children: React.ReactNode;
  handleSheetChanges?: (expanded: boolean) => void;
  onClose?: () => void;
}

const BottomSheet = forwardRef<BottomSheetModal, _BottomSheetProps>(
  ({ children, handleSheetChanges, onClose, ...rest }, ref) => {
    const onChange = (index: number) => {
      const expanded = index !== 0
      handleSheetChanges?.(expanded);
    };

    return (
      <>
        <BottomSheetComponent containerHeight={300} onChange={onChange} ref={ref} {...rest}>
          <BottomSheetView>
            {children}
          </BottomSheetView>
        </BottomSheetComponent>
      </>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1, minHeight: 100,
    padding: spacing.md,
  },
});

export default BottomSheet;
