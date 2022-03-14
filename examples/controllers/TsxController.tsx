/** @jsx h */
import { h, Controller, Context, Get } from "../../mod.ts";

const mystyle = {
  color: "purple",
  backgroundColor: "DodgerBlue",
  padding: "10px",
  fontFamily: "Arial"
};

const Homepage = ({ props }: any) => (
  <html>
    <body>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{
          __html: `
          .purple {
            color: green;
            margin-left:30px;
      }
    `}} />
      </head>
      <div>
        <h1>Page not found</h1>
        <div style="color:blue">1111</div>
        <div class="purple">2222</div>
        <div style={mystyle}>33333</div>

        <div>{props.status}</div>
        <div>{props.message}</div>

        <ul>
          {props.items.map((item: string) => (
            <li>{item}</li>
          ))}
        </ul>
      </div>

      <script>
        const ul = document.querySelector('ul');
        const li  = document.createElement('li');
        li.innerHTML = 'travels';
        ul.appendChild(li);
        console.log('----------created');
      </script>
    </body>
  </html>
);

@Controller()
export class TsxController {

  constructor() {
    console.log("--------------- tsx controller created")
  }

  @Get("/jsx")
  jsx(ctx: Context) {
    const data = {
      status: 404,
      message: "not found",
      items: ["music", "movies", "games"]
    }
    // const a = ctx.renderJsx(<Homepage props={data} />);
    // console.log(a)
    return <Homepage props={data} />;
  }

}