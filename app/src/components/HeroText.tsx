export default function HeroText() {
  const recurse = new URLSearchParams(window.location.search).get('recurse');

  if (recurse === '1') {
    return (
      <>
        <h1>Welcome back!</h1>
        <p>Great to see you again :)</p>
      </>
    );
  }

  return (
    <>
      <h1>Hi, I'm Peter</h1>
      <p>Developer &amp; Creator</p>
    </>
  );
}
