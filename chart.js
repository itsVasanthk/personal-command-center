
const fs = require('fs');
let content = fs.readFileSync('src/screens/AnalyticsScreen.tsx', 'utf8');

const extraLineProps = ' curved areaChart startFillColor={colors.primary} endFillColor={colors.background} startOpacity={0.4} endOpacity={0.05} isAnimated animationDuration={1200} ';
const extraBarProps = ' isAnimated animationDuration={1200} ';

content = content.replace(/<LineChart /g, '<LineChart ' + extraLineProps);
content = content.replace(/<BarChart /g, '<BarChart ' + extraBarProps);

fs.writeFileSync('src/screens/AnalyticsScreen.tsx', content);

