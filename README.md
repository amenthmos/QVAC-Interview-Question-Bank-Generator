# QVAC Interview Question Bank Generator

Enter a job role, get 5 realistic interview questions likely to be asked for that role — generated on-device. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:32027

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown.

## Example

**Input:** role `junior backend developer`

**Output:**
```
1. What's your experience with frontend frameworks like React or Angular, and how do you approach building a UI for a backend application?
2. Can you describe a project where you had to work with a team to deliver a complex feature? What was your role, and how did you collaborate?
3. How do you handle errors in your code, and what steps do you take to debug them?
4. Tell me about a time when you had to explain a technical concept to a non-technical user. What was the outcome?
5. How do you stay up-to-date with industry trends and new technologies in backend development?
```

## License

MIT
