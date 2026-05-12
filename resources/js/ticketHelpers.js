export function formatTicketLabel(value){
    return String(value || '')
        .replace('_',' ')
        .replace(/\b\w/g,(letter)=>letter.toUpperCase());
}

export function canCloseTicket(ticket){
    return Boolean(ticket?.assigned_user);
}

export function getTicketCloseError(ticket){
    if(canCloseTicket(ticket)){
        return '';
    }

    return 'Ticket must be assigned to a user before it can be closed.';
}

export function getPrioritySortWeight(priority){
    const weights={
        high:3,
        medium:2,
        low:1,
    };

    return weights[priority] || 0;
}

export function getStatusSortWeight(status){
    const weights={
        open:1,
        in_progress:2,
        closed:3,
    };

    return weights[status] || 0;
}