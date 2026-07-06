import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { ReportProjectSection } from '../../components/reports/ReportProjectSection';
import { ScreenLayout } from '../../components/ScreenLayout';
import { formatDateOnly, formatMoney } from '../../utils/format';
import {
  buildReport,
  parseReportDateParam,
  parseReportProjectIds,
  type ReportResult,
} from '../../utils/reports';

function formatPeriodLabel(fromDate: string | null, toDate: string | null): string {
  if (fromDate && toDate) {
    return `${formatDateOnly(fromDate)} — ${formatDateOnly(toDate)}`;
  }

  if (fromDate) {
    return `с ${formatDateOnly(fromDate)}`;
  }

  if (toDate) {
    return `по ${formatDateOnly(toDate)}`;
  }

  return 'за всё время';
}

export default function ReportFormScreen() {
  const params = useLocalSearchParams<{
    projectIds?: string;
    fromDate?: string;
    toDate?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    const selectedIds = parseReportProjectIds(params.projectIds);
    const fromDate = parseReportDateParam(params.fromDate);
    const toDate = parseReportDateParam(params.toDate);

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await buildReport({
        projectIds: selectedIds,
        fromDate,
        toDate,
      });

      if (result.sections.length === 0) {
        setReport(null);
        setErrorMessage('Нет проектов для отчёта за выбранный период');
        return;
      }

      setReport(result);
    } catch (error) {
      console.error(error);
      setReport(null);
      setErrorMessage('Не удалось сформировать отчёт');
    } finally {
      setLoading(false);
    }
  }, [params.fromDate, params.projectIds, params.toDate]);

  useFocusEffect(
    useCallback(() => {
      void loadReport();
    }, [loadReport]),
  );

  const hasPeriodFilter = Boolean(report?.fromDate || report?.toDate);

  return (
    <ScreenLayout title="Отчёт">
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : errorMessage ? (
        <Text variant="bodyLarge" style={styles.error}>
          {errorMessage}
        </Text>
      ) : report ? (
        <View>
          <Text variant="bodyMedium" style={styles.period}>
            {hasPeriodFilter
              ? `Период проектов: ${formatPeriodLabel(report.fromDate, report.toDate)}`
              : 'Все проекты по дате'}
          </Text>

          <Card style={styles.totalsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.totalsTitle}>
                Итого по {report.sections.length}{' '}
                {report.sections.length === 1 ? 'проекту' : 'проектам'}
              </Text>
              <Text variant="bodyMedium">
                Сумма проектов: {formatMoney(report.totals.projectAmount)}
              </Text>
              <Text variant="bodyMedium">
                Расходы: {formatMoney(report.totals.expensesTotal)}
              </Text>
              <Text
                variant="titleMedium"
                style={[
                  styles.profitTotal,
                  report.totals.profit < 0 && styles.warning,
                ]}
              >
                Прибыль: {formatMoney(report.totals.profit)}
              </Text>
              <Text variant="bodySmall" style={styles.divider}>
                Бюджет
              </Text>
              <Text variant="bodyMedium">
                План: {formatMoney(report.totals.planned)}
              </Text>
              <Text variant="bodyMedium">
                Факт: {formatMoney(report.totals.actual)}
              </Text>
              <Text variant="bodyMedium">
                Остаток: {formatMoney(report.totals.remaining)}
              </Text>
              {report.overBudgetProjectNames.length > 0 ? (
                <Text variant="bodyMedium" style={styles.warning}>
                  Превышение бюджета: {report.overBudgetProjectNames.join(', ')}
                </Text>
              ) : (
                <Text variant="bodySmall" style={styles.ok}>
                  Превышений бюджета нет
                </Text>
              )}
            </Card.Content>
          </Card>

          {report.sections.map((section) => (
            <ReportProjectSection key={section.project.id} section={section} />
          ))}
        </View>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 24,
  },
  error: {
    color: '#c62828',
  },
  period: {
    color: '#5c6370',
    marginBottom: 12,
  },
  totalsCard: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  totalsTitle: {
    color: '#1a1a2e',
    marginBottom: 8,
  },
  profitTotal: {
    color: '#1a5fb4',
    marginTop: 4,
    marginBottom: 8,
  },
  divider: {
    color: '#9aa0a6',
    marginTop: 8,
    marginBottom: 4,
  },
  warning: {
    color: '#c62828',
    marginTop: 8,
  },
  ok: {
    color: '#2e7d32',
    marginTop: 8,
  },
});
