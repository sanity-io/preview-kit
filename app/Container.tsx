export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <main className="container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100vh',
          maxHeight: '100dvh',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </main>
  )
}
