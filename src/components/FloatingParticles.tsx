const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 4,
    type: i % 3, // 0: rose, 1: emerald, 2: gold
  }));

  const getColor = (type: number) => {
    switch (type) {
      case 0:
        return "hsl(var(--rose) / 0.6)";
      case 1:
        return "hsl(var(--emerald) / 0.5)";
      case 2:
        return "hsl(var(--gold) / 0.6)";
      default:
        return "hsl(var(--primary) / 0.6)";
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: `radial-gradient(circle, ${getColor(p.type)}, transparent)`,
            boxShadow: `0 0 ${p.size * 2}px ${getColor(p.type)}`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
