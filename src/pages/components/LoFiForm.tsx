import React, { FormEvent, useCallback, useEffect, useState } from "react";
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
  Button,
  Grid,
  GridItem,
  Spinner,
  Card,
  CardBody,
  Text,
  Image,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  CardHeader,
  Heading,
  Stack,
} from "@chakra-ui/react";
import { api } from "~/utils/api";
import { CopyIcon, DownloadIcon, CheckIcon } from "@chakra-ui/icons";

interface ImageDisplayProps {
  alt: string;
  header: string;
  imgSrc: string;
  fileSize: string;
  fileType: string;
}

const ImageDisplay = (props: ImageDisplayProps) => {
  const { alt, header, imgSrc, fileSize, fileType } = props;

  return (
    <Card>
      <CardHeader>
        <Heading size="md">{header}</Heading>
      </CardHeader>
      <CardBody>
        {fileType === "svg" ? (
          <div dangerouslySetInnerHTML={{ __html: imgSrc }} />
        ) : (
          <Image objectFit="cover" src={imgSrc} alt={alt} p={0} />
        )}
        <Text>{fileSize}</Text>
      </CardBody>
    </Card>
  );
};

const DEFAULT = {
  webpath: "",
  numShapes: 128,
  blurLevel: 4,
  origSrc: null,
  origSize: null,
  svgSrc: null,
  svgSize: null,
  error: null,
  isTransforming: false,
  svgBtn: {
    text: "Copy SVG as text",
    copied: false,
  },
  downloadBtn: {
    text: "Download SVG",
    downloaded: false,
  },
};

export default () => {
  const [webpath, setWebpath] = useState(DEFAULT.webpath);
  const [numShapes, setNumShapes] = useState(DEFAULT.numShapes);
  const [blurLevel, setBlurLevel] = useState(DEFAULT.blurLevel);
  const [origSrc, setOrigSrc] = useState<string | null>(DEFAULT.origSrc);
  const [origSize, setOrigSize] = useState<string | null>(DEFAULT.origSize);
  const [svgSrc, setSvgSrc] = useState<string | null>(DEFAULT.svgSrc);
  const [svgSize, setSvgSize] = useState<string | null>(DEFAULT.svgSize);
  const [error, setError] = useState<string | null>(DEFAULT.error);
  const [isTransforming, setIsTransforming] = useState(DEFAULT.isTransforming);
  const [svgBtn, setSvgBtn] = useState(DEFAULT.svgBtn);
  const [downloadBtn, setDownloadBtn] = useState(DEFAULT.downloadBtn);

  const transformImage = api.transform.transformImage.useMutation({
    onSuccess: (data) => {
      setIsTransforming(false);
      setSvgSrc(data?.svg || null);
      setOrigSize(data?.origingalBytes || null);
      setSvgSize(data?.svgBytes || null);
      setError(data?.error || null);
      setSvgBtn(DEFAULT.svgBtn);
      setDownloadBtn(DEFAULT.downloadBtn);
    },
  });

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

  const onChangeBlurLevel = useCallback(
    (value: number) => {
      setBlurLevel(value);
    },
    [setBlurLevel],
  );

  const onTransformImage = useCallback(() => {
    setIsTransforming(true);
    setBlurLevel(DEFAULT.blurLevel);
    setOrigSrc(webpath);
    setSvgSrc(DEFAULT.svgSrc);

    transformImage.mutate({
      url: webpath,
      numberOfShapes: numShapes,
    });
  }, [webpath, numShapes]);

  const onDownloadSvg = useCallback(() => {
    if (!!svgSrc) {
      const svgBlob = new Blob([svgSrc], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "output.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setDownloadBtn({ text: "Downloaded", downloaded: true });
    }
  }, [svgSrc]);

  useEffect(() => {
    const updatedSvgSrc =
      svgSrc?.replace(
        /<feGaussianBlur stdDeviation=.* \/>/,
        `<feGaussianBlur stdDeviation="${blurLevel}" />`,
      ) || "";
    setSvgSrc(updatedSvgSrc);
  }, [blurLevel]);

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
            The number of shapes that will compose the final image. More shapes
            will give the svg more detail at the cost of a bigger filesize.
          </FormHelperText>
        </FormControl>
        {!svgSrc ? null : (
          <FormControl>
            <FormLabel>Blur</FormLabel>
            <Slider
              aria-label="slider-ex-1"
              defaultValue={8}
              max={16}
              min={0}
              value={blurLevel}
              onChange={onChangeBlurLevel}
              colorScheme="teal"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            {blurLevel}
            <FormHelperText>
              Blur level is set to 4 by default, but you can change it here by
              adjusting the slider. Set blur to 0 to see the image without a
              blur filter at all
            </FormHelperText>
          </FormControl>
        )}
        <Button
          disabled={!webpath.length}
          alignSelf={"start"}
          colorScheme="teal"
          size={"lg"}
          onClick={onTransformImage}
        >
          Transform Image
        </Button>
        {isTransforming ? (
          <Spinner />
        ) : !!error ? (
          <Text color="red">{error}</Text>
        ) : !origSrc ? null : (
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <ImageDisplay
                alt="original image"
                fileSize={origSize || ""}
                fileType="*"
                header="Original"
                imgSrc={origSrc}
              />
            </GridItem>
            <GridItem>
              <ImageDisplay
                alt="transformed svg"
                fileSize={svgSize || ""}
                fileType={"svg"}
                header="SVG"
                imgSrc={svgSrc || ""}
              />
              <Stack spacing={4} direction="row" align="start" mt="4">
                <Button
                  leftIcon={
                    downloadBtn.downloaded ? <CheckIcon /> : <DownloadIcon />
                  }
                  colorScheme="teal"
                  onClick={onDownloadSvg}
                >
                  {downloadBtn.text}
                </Button>
                <Button
                  leftIcon={svgBtn.copied ? <CheckIcon /> : <CopyIcon />}
                  colorScheme="teal"
                  variant={"outline"}
                  onClick={() => {
                    navigator.clipboard.writeText(svgSrc || "").then(() => {
                      setSvgBtn({ text: "Copied", copied: true });
                    });
                  }}
                >
                  {svgBtn.text}
                </Button>
              </Stack>
            </GridItem>
          </Grid>
        )}
      </VStack>
    </Container>
  );
};
