export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>EV Range Prediction</title>
      </head>
      <body className="min-h-screen bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
