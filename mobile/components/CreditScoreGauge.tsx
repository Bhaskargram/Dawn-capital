import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Config';

type Props = {
  score: number;
  lastUpdated?: string;
};

const getScoreData = (score: number) => {
  if (score >= 750) return { color: '#22c55e', label: 'Excellent', bg: 'rgba(34,197,94,0.12)' };
  if (score >= 650) return { color: '#3b82f6', label: 'Good', bg: 'rgba(59,130,246,0.12)' };
  if (score >= 600) return { color: '#fbbf24', label: 'Fair', bg: 'rgba(251,191,36,0.12)' };
  if (score > 0) return { color: '#ef4444', label: 'Poor', bg: 'rgba(239,68,68,0.12)' };
  return { color: '#64748b', label: 'N/A', bg: 'rgba(100,116,139,0.12)' };
};

export default function CreditScoreGauge({ score, lastUpdated }: Props) {
  const { color, label, bg } = getScoreData(score);

  // Progress from 0 to 1 based on 300-850 range
  const progress = score > 0 ? Math.min(Math.max((score - 300) / 550, 0), 1) : 0;

  // Create gauge segments
  const segments = [
    { range: '300', color: '#ef4444', min: 0, max: 0.18 },
    { range: '450', color: '#f97316', min: 0.18, max: 0.36 },
    { range: '600', color: '#fbbf24', min: 0.36, max: 0.55 },
    { range: '650', color: '#3b82f6', min: 0.55, max: 0.73 },
    { range: '750', color: '#22c55e', min: 0.73, max: 1.0 },
  ];

  return (
    <View style={[s.container, { backgroundColor: bg, borderColor: color + '25' }]}>
      {/* Gauge Bar */}
      <View style={s.gaugeBarContainer}>
        {segments.map((seg, i) => (
          <View
            key={i}
            style={[
              s.gaugeSegment,
              {
                backgroundColor: progress >= seg.min ? seg.color : 'rgba(255,255,255,0.06)',
                opacity: progress >= seg.min ? (progress >= seg.max ? 1 : 0.7) : 0.2,
                borderTopLeftRadius: i === 0 ? 6 : 0,
                borderBottomLeftRadius: i === 0 ? 6 : 0,
                borderTopRightRadius: i === segments.length - 1 ? 6 : 0,
                borderBottomRightRadius: i === segments.length - 1 ? 6 : 0,
              },
            ]}
          />
        ))}
      </View>

      {/* Score Display */}
      <View style={s.scoreRow}>
        <View style={s.scoreCenter}>
          <Text style={[s.scoreValue, { color }]}>{score > 0 ? score : '—'}</Text>
          <Text style={s.scoreDivider}>/850</Text>
        </View>
        <View style={[s.labelBadge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
          <Text style={[s.labelText, { color }]}>{label}</Text>
        </View>
      </View>

      {/* Labels */}
      <View style={s.rangeRow}>
        <Text style={s.rangeLabel}>300</Text>
        <Text style={s.rangeLabel}>Poor</Text>
        <Text style={s.rangeLabel}>Fair</Text>
        <Text style={s.rangeLabel}>Good</Text>
        <Text style={s.rangeLabel}>850</Text>
      </View>

      {lastUpdated && (
        <Text style={s.updated}>Updated {new Date(lastUpdated).toLocaleDateString()}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  gaugeBarContainer: {
    flexDirection: 'row',
    height: 12,
    gap: 3,
    marginBottom: 16,
  },
  gaugeSegment: {
    flex: 1,
    borderRadius: 0,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreCenter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreDivider: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  labelBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '600',
  },
  updated: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
});
