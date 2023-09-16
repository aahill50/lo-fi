import React, { ChangeEvent, FormEvent, useCallback, useState } from "react";
import {
  Container,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  VStack,
  NumberInputField,
  NumberInput,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  InputGroup,
  Text,
  Stack,
  Skeleton,
  Box,
} from "@chakra-ui/react";

/**
 * mode: 0=combo
 * 1=triangle
 * 2=rect
 * 3=ellipse
 * 4=circle
 * 5=rotatedrect
 * 6=beziers
 * 7=rotatedellipse
 * 8=polygon
 */

enum ShapeType {
  "All Shapes",
  "Triangles",
  "Rectangles",
  "Ellipses",
  "Circles",
  "Rotated Rectangles",
  "Bezier Curves",
  "Rotated Ellipses",
  "Polygons",
}

const shapeTypes: (keyof typeof ShapeType)[] = [
  "All Shapes",
  "Triangles",
  "Rectangles",
  "Ellipses",
  "Circles",
  "Rotated Rectangles",
  "Bezier Curves",
  "Rotated Ellipses",
  "Polygons",
];

const isValidHexCode = (text: string): boolean => {
  return !!text.match(/^#?(?:[0-9a-fA-F]{3}){1,2}$/gi);
};

export default () => {
  const [webpath, setWebpath] = useState("");
  const [numShapes, setNumShapes] = useState(8);
  const [shapeType, setShapeType] = useState(0);
  const [blurLevel, setBlurLevel] = useState(0);
  const [bgColor, setBgColor] = useState("FFFFFF");

  const onChangeWebpath = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      setWebpath(e.currentTarget.value);
    },
    [setWebpath],
  );

  const onChangeNumShapes = useCallback(
    (_: string, newNumShapes: number) => {
      setNumShapes(newNumShapes);
    },
    [setNumShapes],
  );

  const onChangeShapeType = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setShapeType(Number(e.currentTarget.value));
    },
    [setShapeType],
  );

  const onChangeBlurLevel = useCallback(
    (_: string, newBlurLevel: number) => {
      setBlurLevel(newBlurLevel);
    },
    [setBlurLevel],
  );

  const onChangeBgColor = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      setBgColor(e.currentTarget.value);
    },
    [setBgColor],
  );

  const hasBgColor = !!bgColor.length;
  const isBgColorValid = isValidHexCode(bgColor);

  return (
    <Container maxW="full" p={8} bg={"white"} shadow={"lg"} rounded={"base"}>
      <VStack spacing={"8"}>
        <FormControl>
          <FormLabel>Image Url</FormLabel>
          <Input
            type="text"
            onChange={onChangeWebpath}
            placeholder="Enter image url"
            value={webpath}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Number of shapes</FormLabel>
          <NumberInput value={numShapes} onChange={onChangeNumShapes}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            The number of shapes that will compose the final image
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Shape Type</FormLabel>
          <Select
            placeholder="Select option"
            onChange={onChangeShapeType}
            value={shapeType}
          >
            {shapeTypes.map((shapeType, index) => (
              <option value={index}>{shapeType}</option>
            ))}
          </Select>
          <FormHelperText>
            Determines the type of shapes that will be used to generate the
            final image
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Blur (applies to svg only)</FormLabel>
          <NumberInput value={blurLevel} onChange={onChangeBlurLevel}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>
            Determines the level of blur added to the resullting image (applies
            only to the svg). Corresponds to the{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stdDeviation"
              target="_blank"
            >
              stdDeviation attribute
            </a>
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Background Color Hex Code (applies to svg only)</FormLabel>
          <InputGroup>
            <Stack w="full" spacing="4">
              <Input
                type="text"
                onChange={onChangeBgColor}
                placeholder="FFFFFF"
                value={bgColor}
                isInvalid={!isBgColorValid}
              />
              <Box
                bgColor={isBgColorValid ? `#${bgColor}` : "white"}
                height="40px"
                mt={-2}
                border={"1px"}
                borderColor={hasBgColor && isBgColorValid ? "black" : "transparent"}
                rounded={"base"}
                textStyle={"input"}
              >
                {isBgColorValid || !hasBgColor ? null : (
                  <Text color="red" px={4}>
                    #{bgColor} is not a valid hex code
                  </Text>
                )}
              </Box>
            </Stack>
          </InputGroup>
        </FormControl>
      </VStack>
      <pre>
        {JSON.stringify(
          {
            webpath,
            numShapes,
            shapeType,
            blurLevel,
            bgColor,
          },
          null,
          2,
        )}
      </pre>
    </Container>
  );
};
