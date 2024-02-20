# Zoom to bounding box

https://observablehq.com/@d3/zoom-to-bounding-box@182

View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
npx http-server
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@5
npm install https://api.observablehq.com/d/416392da175798b4@182.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "@d3/zoom-to-bounding-box";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();




Source code: https://observablehq.com/@d3/zoom-to-bounding-box?intent=fork
Dataset: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/VOQCHQ
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~
