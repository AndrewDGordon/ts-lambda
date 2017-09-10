// ts-lambda.ts
// Andy Gordon

// put default:assertNever(e) at end of switch on e, or better still, enable strict checking
function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}

// user defined type guard
function instanceOfT(object: any): object is T {
    return 'item' in object;
}
function instanceOfError(object: any): object is Error {
    return 'name' in object && 'message' in object;
}

// see Discriminated Unions on http://www.typescriptlang.org/docs/handbook/advanced-types.html

interface Var {kind: "Var"; id: string; } 
interface App {kind: "App"; rator:T; rand:T; }
interface Abs {kind: "Abs"; id:string; body:T; } 
interface Const {kind: "Const", const:number}  // present to test pattern-matching exhaustiveness checks
type V = Abs;
type T = Var | V | App;

function Var(id:string):Var { return {kind:"Var", id:id}}
function App(rator:T, rand:T):App { return {kind:"App", rator:rator, rand:rand}}
function Abs(id:string, body:T):Abs { return {kind:"Abs", id:id, body:body}}

function pretty (t:T):string { 
    switch(t.kind){
        case "Var":
          return t.id;
        case "App":
          return pretty(t.rator) + "(" + pretty(t.rand) + ")";
        case "Abs":
          return "fun(" + t.id + "){" + pretty(t.body) + "}";
    }
}

interface Cons { kind: "Cons"; id:string; value: V; rest: E; }
interface Empty { kind: "Empty"; }
type E = Cons | Empty

let empty: Empty = { kind: "Empty" }

function cons(id:string, v:V, e:E):E {
    return { kind: "Cons", id:id, value:v, rest:e };
}

function lookup(e:E, x:string): V | Error {
  switch(e.kind) {
        case "Cons":
            if (e.id == x)
                return e.value;
            else
                return (lookup(e.rest, x));
        case "Empty":
            return Error(x + " not found");
  }
}

function evaluate(e:E,t:T): V | Error {
    switch(t.kind) {
        case "Var":
          return lookup(e,t.id);
        case "Abs":
          return t;
        case "App":
          let v1 = evaluate(e, t.rator);
          if (instanceOfError(v1))
            return Error("App rator " + v1.message);

          let v2 = evaluate(e, t.rand);
          if (instanceOfError(v2))
            return Error("App rand " + v2.message);

          return evaluate(cons(v1.id, v2, e), v1.body);
    }
}

// (S f g x) = ((f x) (g x))
let I:T = Abs("x", Var("x"))
let K:T = Abs("x", Abs("y", Var("y")))
let S:T = Abs("f", Abs("g", Abs("x", App(App(Var("f"),Var("x")), App(Var("g"),Var("x"))))))

let t1 = App(App(K,S),I)
let t2 = Var("z")

function test (t:T): string {
    let outcome = evaluate(empty,t)
    if (instanceOfError(outcome))
        return "evaluation of " + pretty(t) + " failed with the error message " + outcome.message;
    else
        return "evaluation of " + pretty(t) + " yielded the value " + pretty(outcome);
}

console.log(test(t1))