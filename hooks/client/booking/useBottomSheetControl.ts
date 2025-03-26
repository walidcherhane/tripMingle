import { useRef, useState, useCallback } from "react";
import { Keyboard } from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

export function useBottomSheetControl() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useRef(["95%"]).current;
  const [currentSnapIndex, setCurrentSnapIndex] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);

  // Sheet index constants
  const sheetIndexes = {
    normal: -1,
    full: 1,
  };

  const handleSheetChange = (index: number) => {
    setCurrentSnapIndex(index);
    if (index < 2) {
      setSearchFocused(false);
      Keyboard.dismiss();
    }
  };

  const expandSheet = () => {
    bottomSheetRef.current?.snapToIndex(sheetIndexes.full);
  };

  const collapseSheet = () => {
    bottomSheetRef.current?.snapToIndex(sheetIndexes.normal);
    setSearchFocused(false);
    Keyboard.dismiss();
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
    expandSheet();
  };

  const handleSearchBlur = (hasPredictions: boolean = false) => {
    if (!hasPredictions) {
      setSearchFocused(false);
      collapseSheet();
    }
  };

  return {
    bottomSheetRef,
    snapPoints,
    currentSnapIndex,
    searchFocused,
    setSearchFocused,
    sheetIndexes,
    handleSheetChange,
    expandSheet,
    collapseSheet,
    handleSearchFocus,
    handleSearchBlur,
  };
}
