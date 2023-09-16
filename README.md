![Lo-Fi](https://i.imgur.com/boTI4vS.gif)

lo-fi aims to reduce initial page load time by providing a low-poly representation of an image.
That image is then obscured using a gaussian blur and converted into an svg, which can be served back to the end-user as text.

In other words... lo-fi >> loads fast!

lo-fi is a node server that accepts

This version of lo-fi is written using the t3 stack:
Typescript
Next.js
Tailwind CSS
Chakra UI
tRPC

## Install Go

First, you'll need to [install Go](https://golang.org/doc/install)

Once `go` has been installed, add it to your PATH env var

Open your bash_profile and add the following lines at the end:

```bash
# add go to PATH
export PATH=$PATH:/usr/local/go/bin
```

Save and exit your bash_profile

Now [source](https://superuser.com/questions/46139/what-does-source-do/46146#46146) your bash profile and run `which go`. If everything was set up correctly, you should see the path to your `go` executable

## Install ImageMagick

Next, you'll need to install [ImageMagick](https://imagemagick.org/script/download.php)

This is needed if you want to output .gif files as it uses ImageMagick's `convert` command

Once it has been installed, make sure the `convert` executable is added to PATH

## Install Primitive

Finally, you'll need to install [primitive](github.com/fogleman/primitive):

Run `go get -u github.com/fogleman/primitive`, which should download and install `primitive`

By default `go` will install user downloaded packages to `$HOME/go/bin/`, so similar to above, add this line to the bottom of your bash_profile:

```
# add downloaded go packages to PATH
export PATH=$PATH:$HOME/go/bin
```

Once again, [source](https://superuser.com/questions/46139/what-does-source-do/46146#46146) your bash profile, then run `which primitive`. If everything was set up correctly, you should now see the path to your `primitive` executable

## Local Usage

`npm install`

`npm dev`

Now your lo-fi server is running! Head to http://localhost:3000/placeholder to see what it can do!

Now you can generate svgs or gifs by hitting the endpoint (`http://localhost:7041/placeholder` by default) with a `POST` request whose body contains the desired fields. This can be as simple as just using the required fields:

```
{
  "webpath" : "URL_TO_IMAGE",
  "fileType" : "svg"
}
```

Additional fields can be passed to modify the result:

### Body properties

| Field              | Type   | Required | Default | Description                                                                                                                                      |
| ------------------ | ------ | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| fileType           | string | true     | svg     | The type of file to output. Currently supports `gif` and `svg`                                                                                   |
| webpath            | string | true     |         | The url of the image to be downloaded                                                                                                            |
| numberOfPrimitives | number | false    | 8       | The number of shapes that will compose the final image                                                                                           |
| primitiveMode      | number | false    | 0       | Determines the type of shapes that will be used. Defaults to 0 (all shapes). Corresponds to the `m` flag from [primitive](https://goo.gl/U19fy5) |
| blurLevel          | number | false    | 12      | Determines the level of gaussian blur that will be applied. Only applicable to fileType: `svg`                                                   |
| bgColor            | hex    | false    | ffffff  | Determines the background color of the svg                                                                                                       |
