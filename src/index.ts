import 'dotenv/config';
import app from './server';

const port = Number(process.env.PORT || 5050);
app.listen(port, () => {
  console.log(`✅ API running at http://localhost:${port}`);
});
