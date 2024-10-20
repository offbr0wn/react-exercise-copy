import {
  type IStyleSheetManager,
  type ShouldForwardProp,
  StyleSheetManager as SSM,
} from "styled-components";
import isPropValid from "@emotion/is-prop-valid";

const shouldForwardPropFunc: ShouldForwardProp<"web"> = (propName, target) => {
  if (typeof target === "string") {
    // For HTML elements, forward the prop if it is a valid HTML attribute
    return isPropValid(propName);
  }
  // For other elements, forward all props
  return true;
};

const StyleSheetManager = ({
  children,
  enableVendorPrefixes,
  sheet,
}: IStyleSheetManager) => (
  <SSM
    shouldForwardProp={shouldForwardPropFunc}
    enableVendorPrefixes={enableVendorPrefixes}
    sheet={sheet}
  >
    {children}
  </SSM>
);

export default StyleSheetManager;
