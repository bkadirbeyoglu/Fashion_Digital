export const dateStringToDate = (dateString: string): Date => {
    // 2012-10-30
    const dateParts = dateString
                        .split("-")
                        .map((value: string): number => parseInt(value));

    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
}