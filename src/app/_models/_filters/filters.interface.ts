interface AddFields {
  $addFields: {
    created_at_formatted: {
      $toDate: string;
    },
  };
}

interface Unwind {
  $unwind: string;
}

interface Match {
  $match: {
    terminal_number: { $in: string[] };
    type?: number;
    created_at: { $gt: number; $lt: number };
  };
}

interface Group {
  $group: {
    _id: string | { $month: string } | { month: { $month: string }; type: string }; 
    count?: { $sum: number };
    avg?: { $avg: string };
    total?: { $sum: string };
    quantity?: { $sum: string };
    product?: { $first: string };
    decimals?: { $first: string };
    created_at?: { $first: string };
    created_at_formatted?: { $first: string };
  };
}

interface Sort {
  $sort: {
    _id?: number;
    quantity?: number;
  };
}

interface Limit {
  $limit: number;
}

export type FilterStep = AddFields | Unwind | Match | Group | Sort | Limit;