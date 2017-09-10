// ts-lambda.ts
// Andy Gordon
// put default:assertNever(e) at end of switch on e, or better still, enable strict checking
function assertNever(x) {
    throw new Error("Unexpected object: " + x);
}
// user defined type guard
function instanceOfT(object) {
    return 'item' in object;
}
function instanceOfError(object) {
    return 'name' in object && 'message' in object;
}
function Var(id) { return { kind: "Var", id: id }; }
function App(rator, rand) { return { kind: "App", rator: rator, rand: rand }; }
function Abs(id, body) { return { kind: "Abs", id: id, body: body }; }
function pretty(t) {
    switch (t.kind) {
        case "Var":
            return t.id;
        case "App":
            return pretty(t.rator) + "(" + pretty(t.rand) + ")";
        case "Abs":
            return "fun(" + t.id + "){" + pretty(t.body) + "}";
    }
}
var empty = { kind: "Empty" };
function cons(id, v, e) {
    return { kind: "Cons", id: id, value: v, rest: e };
}
function lookup(e, x) {
    switch (e.kind) {
        case "Cons":
            if (e.id == x)
                return e.value;
            else
                return (lookup(e.rest, x));
        case "Empty":
            return Error(x + " not found");
    }
}
function evaluate(e, t) {
    switch (t.kind) {
        case "Var":
            return lookup(e, t.id);
        case "Abs":
            return t;
        case "App":
            var v1 = evaluate(e, t.rator);
            if (instanceOfError(v1))
                return Error("App rator " + v1.message);
            var v2 = evaluate(e, t.rand);
            if (instanceOfError(v2))
                return Error("App rand " + v2.message);
            return evaluate(cons(v1.id, v2, e), v1.body);
    }
}
// (S f g x) = ((f x) (g x))
var I = Abs("x", Var("x"));
var K = Abs("x", Abs("y", Var("y")));
var S = Abs("f", Abs("g", Abs("x", App(App(Var("f"), Var("x")), App(Var("g"), Var("x"))))));
var t1 = App(App(K, S), I);
var t2 = Var("z");
function test(t) {
    var outcome = evaluate(empty, t);
    if (instanceOfError(outcome))
        return "evaluation of " + pretty(t) + " failed with the error message " + outcome.message;
    else
        return "evaluation of " + pretty(t) + " yielded the value " + pretty(outcome);
}
console.log(test(t1));
