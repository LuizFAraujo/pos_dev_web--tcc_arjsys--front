// ========================================
// MOCK DATA - BOM ESTRUTURA (Simula tabela BOM_ESTRUTURA do BD)
// ========================================

export interface BOMRelacao {
    codigo_pai: string;
    codigo_filho: string;
    quantidade: number;
    ordem: string;
}

export const mockBOMRelacional: BOMRelacao[] = [
    // ========== ESTRUTURA 1: VIATURA SPIN (10.PCT.GM07.021.0000) ==========
    { codigo_pai: '10.PCT.GM07.021.0000', codigo_filho: '30.PRT.GM07.001.0000', quantidade: 1, ordem: '0010' },
    { codigo_pai: '10.PCT.GM07.021.0000', codigo_filho: '39.PAT.GM07.043.0000', quantidade: 1, ordem: '0020' },
    { codigo_pai: '10.PCT.GM07.021.0000', codigo_filho: '39.PAT.GM07.041.0000', quantidade: 2, ordem: '0030' },
    { codigo_pai: '10.PCT.GM07.021.0000', codigo_filho: '70.PAT.REVT.065.0000', quantidade: 1, ordem: '0040' },
    { codigo_pai: '10.PCT.GM07.021.0000', codigo_filho: '70.PAT.REVE.111.0000', quantidade: 1, ordem: '0050' },
    { codigo_pai: '10.PCT.GM07.021.0000', codigo_filho: '39.PCT.GM07.010.0000', quantidade: 1, ordem: '0060' },
    
    { codigo_pai: '39.PAT.GM07.043.0000', codigo_filho: '30.SGE.GM07.037.EP3L', quantidade: 2, ordem: '0010' },
    { codigo_pai: '39.PAT.GM07.043.0000', codigo_filho: '72.P13.ZBSR.004.2B13', quantidade: 1, ordem: '0020' },
    { codigo_pai: '39.PAT.GM07.043.0000', codigo_filho: '70.PAT.FLAT.014.0000', quantidade: 2, ordem: '0030' },
    
    { codigo_pai: '30.SGE.GM07.037.EP3L', codigo_filho: '60.SGE.GM07.037.EP3L', quantidade: 1, ordem: '0010' },
    { codigo_pai: '30.SGE.GM07.037.EP3L', codigo_filho: '30.SGE.GM07.037.0000', quantidade: 1, ordem: '0020' },
    
    { codigo_pai: '30.SGE.GM07.037.0000', codigo_filho: '70.FCM.MCLI.003.0000', quantidade: 0.152, ordem: '0010' },
    
    { codigo_pai: '39.PAT.GM07.041.0000', codigo_filho: '40.PAT.ADV.005.00000', quantidade: 1, ordem: '0010' },
    { codigo_pai: '39.PAT.GM07.041.0000', codigo_filho: '30.RGE.GM07.001.EP3T', quantidade: 3, ordem: '0020' },
    { codigo_pai: '39.PAT.GM07.041.0000', codigo_filho: '72.P05.ZB88.00008M30', quantidade: 8, ordem: '0030' },
    { codigo_pai: '39.PAT.GM07.041.0000', codigo_filho: '72.P05.ZB88.00008M25', quantidade: 10, ordem: '0040' },
    
    { codigo_pai: '40.PAT.ADV.005.00000', codigo_filho: '30.DIV.GM07.001.EP3T', quantidade: 1, ordem: '0010' },
    { codigo_pai: '40.PAT.ADV.005.00000', codigo_filho: '58.DIV.GM07.002.0000', quantidade: 1, ordem: '0020' },
    
    { codigo_pai: '30.DIV.GM07.001.EP3T', codigo_filho: '60.DIV.GM07.001.EP3T', quantidade: 1, ordem: '0010' },
    { codigo_pai: '30.DIV.GM07.001.EP3T', codigo_filho: '30.DIV.GM07.001.0000', quantidade: 1, ordem: '0020' },
    
    { codigo_pai: '30.DIV.GM07.001.0000', codigo_filho: '70.FCM.ATQD.006.0000', quantidade: 5.4, ordem: '0010' },
    { codigo_pai: '30.DIV.GM07.001.0000', codigo_filho: '70.FCM.ACLI.008.0000', quantidade: 3.2, ordem: '0020' },
    { codigo_pai: '30.DIV.GM07.001.0000', codigo_filho: '72.R07.ZBSR.00010M21', quantidade: 3, ordem: '0030' },
    
    { codigo_pai: '30.RGE.GM07.001.EP3T', codigo_filho: '60.RGE.GM07.001.EP3T', quantidade: 1, ordem: '0010' },
    { codigo_pai: '30.RGE.GM07.001.EP3T', codigo_filho: '30.RGE.GM07.001.0000', quantidade: 1, ordem: '0020' },
    
    { codigo_pai: '30.RGE.GM07.001.0000', codigo_filho: '70.FCM.ACLI.021.0000', quantidade: 0.752, ordem: '0010' },
    
    // ========== ESTRUTURA 2: PICADOR (10.PIC.MD600.001.0000) ==========
    { codigo_pai: '10.PIC.MD600.001.0000', codigo_filho: '30.EST.MD600.100.0000', quantidade: 1, ordem: '0010' },
    { codigo_pai: '10.PIC.MD600.001.0000', codigo_filho: '30.ROT.MD600.200.0000', quantidade: 1, ordem: '0020' },
    { codigo_pai: '10.PIC.MD600.001.0000', codigo_filho: '72.P13.ZBSR.004.2B13', quantidade: 12, ordem: '0030' },
    { codigo_pai: '10.PIC.MD600.001.0000', codigo_filho: '70.FCM.ACLI.008.0000', quantidade: 45, ordem: '0040' },
    
    { codigo_pai: '30.EST.MD600.100.0000', codigo_filho: '70.FCM.ATQD.006.0000', quantidade: 12, ordem: '0010' },
    { codigo_pai: '30.EST.MD600.100.0000', codigo_filho: '70.FCM.ACLI.021.0000', quantidade: 8.5, ordem: '0020' },
    { codigo_pai: '30.EST.MD600.100.0000', codigo_filho: '72.R07.ZBSR.00010M21', quantidade: 24, ordem: '0030' },
    
    { codigo_pai: '30.ROT.MD600.200.0000', codigo_filho: '70.FCM.MCLI.003.0000', quantidade: 2.8, ordem: '0010' },
    { codigo_pai: '30.ROT.MD600.200.0000', codigo_filho: '72.P05.ZB88.00008M30', quantidade: 16, ordem: '0020' },
    
    // ========== ESTRUTURA 3: ESTEIRA (10.EST.TR800.001.0000) ==========
    { codigo_pai: '10.EST.TR800.001.0000', codigo_filho: '30.COR.TR800.100.0000', quantidade: 1, ordem: '0010' },
    { codigo_pai: '10.EST.TR800.001.0000', codigo_filho: '30.SUP.TR800.200.0000', quantidade: 2, ordem: '0020' },
    { codigo_pai: '10.EST.TR800.001.0000', codigo_filho: '72.P13.ZBSR.004.2B13', quantidade: 8, ordem: '0030' },
    
    { codigo_pai: '30.COR.TR800.100.0000', codigo_filho: '70.FCM.ATQD.006.0000', quantidade: 6, ordem: '0010' },
    { codigo_pai: '30.COR.TR800.100.0000', codigo_filho: '72.P05.ZB88.00008M25', quantidade: 12, ordem: '0020' },
    
    { codigo_pai: '30.SUP.TR800.200.0000', codigo_filho: '70.FCM.ACLI.021.0000', quantidade: 1.2, ordem: '0010' },
    { codigo_pai: '30.SUP.TR800.200.0000', codigo_filho: '72.R07.ZBSR.00010M21', quantidade: 4, ordem: '0020' }
];
