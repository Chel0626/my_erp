'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | number;
  onChange?: (value: string) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = '', onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    // Formata o valor para exibição
    const formatCurrency = (val: string): string => {
      // Remove tudo que não é número
      const numbers = val.replace(/\D/g, '');
      
      if (!numbers) return 'R$ 0,00';
      
      // Converte para número e divide por 100 para ter os centavos
      const amount = parseInt(numbers) / 100;
      
      // Formata com 2 casas decimais
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount);
    };

    // Extrai o valor numérico do display
    const getNumericValue = (val: string): string => {
      const numbers = val.replace(/\D/g, '');
      if (!numbers) return '0';
      const amount = parseInt(numbers) / 100;
      return amount.toFixed(2);
    };

    // Inicializa o display com o valor fornecido
    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        const valueStr = value.toString();
        // Se o valor já está formatado, mantém
        if (valueStr.includes('R$')) {
          setDisplayValue(valueStr);
        } else {
          // Se é um número, formata
          const numbers = valueStr.replace(/\D/g, '');
          setDisplayValue(formatCurrency(numbers.padStart(3, '0')));
        }
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatCurrency(inputValue);
      setDisplayValue(formatted);
      
      if (onChange) {
        onChange(getNumericValue(inputValue));
      }
    };

    return (
      <Input
        ref={ref}
        {...props}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="R$ 0,00"
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
